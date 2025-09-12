import React, { Children, useMemo } from "react";
import styled from "styled-components";

const Carousel = ({
  children,
  visibleItemsCount = 1, // how many items to show
  isInfinite, // is it an infinite loop?
  withIndicator, // show dots?
  initialIndex // initial starting position
}) => {
  const indicatorContainerRef = React.useRef(null);
  const [timeoutInProgress, setTimeoutInProgress] = React.useState(false); // a boolean for if timeout is im progress, used to stop user from spam clicking next or back in certain conditions

  /**
   * Total item
   */
  const originalItemsLength = React.useMemo(() => Children.count(children), [
    children
  ]);

  /**
   * Is the carousel repeating it's item
   */
  const isRepeating = React.useMemo(
    () => isInfinite && Children.count(children) > visibleItemsCount,
    [children, isInfinite, visibleItemsCount]
  );

  /**
   * Current Index Item of the Carousel
   */
  const [currentIndex, setCurrentIndex] = React.useState(
    initialIndex !== undefined ? initialIndex : (isRepeating ? visibleItemsCount : 0)
  );

  /**
   * Is the carousel's transition enabled
   */
  const [isTransitionEnabled, setTransitionEnabled] = React.useState(true);

  /**
   * First touch position to be used in calculation for the swipe speed
   */
  const [touchPosition, setTouchPosition] = React.useState(null);

  /**
   * Handle if the carousel is repeating
   * and the currentIndex have been set to the last or first item
   */
  React.useEffect(() => {
    if (isRepeating) {
      if (
        currentIndex === visibleItemsCount ||
        currentIndex === originalItemsLength
      ) {
        setTransitionEnabled(true);
      }
    }
  }, [currentIndex, isRepeating, visibleItemsCount, originalItemsLength]);

  React.useEffect(() => {
    if (withIndicator) {
      const active = indicatorContainerRef.current?.querySelector(
        ".dots-active"
      );
      if (active) {
        let index = active.getAttribute("data-index");
        if (index !== null && indicatorContainerRef.current?.scrollTo) {
          indicatorContainerRef.current?.scrollTo({
            left: ((Number(index) - 2) / 5) * 50,
            behavior: "smooth"
          });
        }
      }
    }
  }, [withIndicator, currentIndex]);

  /**
   * Move forward to the next item
   */
  const nextItem = () => {
    const isOnEdgeForward = currentIndex > originalItemsLength;
    if (isOnEdgeForward) {
      setTimeoutInProgress(true);
    }

    if (isRepeating || currentIndex < originalItemsLength - visibleItemsCount) {
      setCurrentIndex((prevState) => prevState + 1);
    }
  };

  /**
   * Move backward to the previous item
   */
  const previousItem = () => {
    const isOnEdgeBack = isRepeating
      ? currentIndex <= visibleItemsCount
      : currentIndex === 0;

    if (isOnEdgeBack) {
      setTimeoutInProgress(true);
    }

    if (isRepeating || currentIndex > 0) {
      setCurrentIndex((prevState) => prevState - 1);
    }
  };

  /**
   * Handle when the user start the swipe gesture
   * @param e TouchEvent
   */
  const handleTouchStart = (e) => {
    // Save the first position of the touch
    const touchDown = e.touches[0].clientX;
    setTouchPosition(touchDown);
  };

  /**
   * Handle when the user move the finger in swipe gesture
   * @param e TouchEvent
   */
  const handleTouchMove = (e) => {
    // Get initial location
    const touchDown = touchPosition;

    // Proceed only if the initial position is not null
    if (touchDown === null) {
      return;
    }

    // Get current position
    const currentTouch = e.touches[0].clientX;

    // Get the difference between previous and current position
    const diff = touchDown - currentTouch;

    // Go to next item
    if (diff > 5) {
      nextItem();
    }

    // Go to previous item
    if (diff < -5) {
      previousItem();
    }

    // Reset initial touch position
    setTouchPosition(null);
  };

  /**
   * Handle when carousel transition's ended
   */
  const handleTransitionEnd = () => {
    if (isRepeating) {
      if (currentIndex === 0) {
        setTransitionEnabled(false);
        setCurrentIndex(originalItemsLength);
      } else if (currentIndex === originalItemsLength + visibleItemsCount) {
        setTransitionEnabled(false);
        setCurrentIndex(visibleItemsCount);
      }
    }

    setTimeoutInProgress(false);
  };

  /**
   * Render previous items before the first item
   */
  const extraPreviousItems = React.useMemo(() => {
    let output = [];
    for (let index = 0; index < visibleItemsCount; index++) {
      output.push(Children.toArray(children)[originalItemsLength - 1 - index]);
    }
    output.reverse();
    return output;
  }, [children, originalItemsLength, visibleItemsCount]);

  /**
   * Render next items after the last item
   */
  const extraNextItems = React.useMemo(() => {
    let output = [];
    for (let index = 0; index < visibleItemsCount; index++) {
      output.push(Children.toArray(children)[index]);
    }
    return output;
  }, [children, visibleItemsCount]);

  // render n (n being the count of original items / visibleItemsCount) dots
  const renderDots = React.useMemo(() => {
    let output = [];

    const localShow = isRepeating ? visibleItemsCount : 0;
    const localLength = isRepeating
      ? originalItemsLength
      : Math.ceil(originalItemsLength / visibleItemsCount);
    const calculatedActiveIndex = (() => {
      if (isRepeating) {
        // For infinite carousels with initialIndex offset, adjust the calculation
        // When we start at initialIndex=2, we need to shift by 1 to get the correct center
        const baseIndex = currentIndex - localShow < 0
          ? originalItemsLength + (currentIndex - localShow)
          : currentIndex - localShow;
        return (baseIndex + 1) % originalItemsLength;
      } else {
        return currentIndex;
      }
    })();

    for (let index = 0; index < localLength; index++) {
      let className = "";
      if (calculatedActiveIndex === index) {
        className = "dots-active";
      } else {
        if (calculatedActiveIndex === 0) {
          if (calculatedActiveIndex + index <= 2) {
            className = "dots-close";
          } else {
            className = "dots-far";
          }
        } else if (calculatedActiveIndex === localLength - 1) {
          if (Math.abs(calculatedActiveIndex - index) <= 2) {
            className = "dots-close";
          } else {
            className = "dots-far";
          }
        } else {
          if (Math.abs(calculatedActiveIndex - index) === 1) {
            className = "dots-close";
          } else {
            className = "dots-far";
          }
        }
      }
      output.push(<div key={index} data-index={index} className={className} />);
    }

    return output;
  }, [currentIndex, isRepeating, originalItemsLength, visibleItemsCount]);

  const isNextButtonVisible = useMemo(() => {
    return (
      isRepeating || currentIndex < originalItemsLength - visibleItemsCount
    );
  }, [isRepeating, currentIndex, originalItemsLength, visibleItemsCount]);

  const isPrevButtonVisible = useMemo(() => isRepeating || currentIndex > 0, [
    isRepeating,
    currentIndex
  ]);

  return (
    <StyledCarousel $visibleItemsCount={visibleItemsCount}>
      <div className={`carousel-wrapper`}>
        {isPrevButtonVisible ? (
          <button
            disabled={timeoutInProgress}
            style={{
              cursor: timeoutInProgress ? "not-allowed" : "pointer",
              pointerEvents: timeoutInProgress ? "none" : "inherit"
            }}
            onClick={previousItem}
            className="left-arrow-button"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : null}
        <div
          className={`carousel-content-wrapper`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div
            className={`carousel-content`}
            style={{
              transform: `translateX(-${
                currentIndex * (100 / visibleItemsCount)
              }%)`,
              transition: !isTransitionEnabled ? "none" : undefined
            }}
            onTransitionEnd={() => handleTransitionEnd()}
          >
            {isRepeating && extraPreviousItems}
            {children}
            {isRepeating && extraNextItems}
          </div>
        </div>
        {isNextButtonVisible ? (
          <button
            disabled={timeoutInProgress}
            style={{
              cursor: timeoutInProgress ? "not-allowed" : "pointer",
              pointerEvents: timeoutInProgress ? "none" : "inherit"
            }}
            onClick={nextItem}
            className="right-arrow-button"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : null}
      </div>
      {withIndicator && (
        <div ref={indicatorContainerRef} className={`indicator-container `}>
          {renderDots}
        </div>
      )}
    </StyledCarousel>
  );
};

const StyledCarousel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  .carousel-wrapper {
    display: flex;
    width: 100%;
    position: relative;
  }

  .carousel-content-wrapper {
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .carousel-content {
    display: flex;
    transition: all 250ms linear;
    -ms-overflow-style: none;
    /* hide scrollbar in IE and Edge */
    scrollbar-width: none;
    /* hide scrollbar in Firefox */
    gap: 0.5rem;
  }

  /* hide scrollbar in webkit browser */

  .carousel-content::-webkit-scrollbar,
  .carousel-content::-webkit-scrollbar {
    display: none;
  }

  .carousel-content > * {
    flex-shrink: 0;
    flex-grow: 1;
    width: ${({ $visibleItemsCount }) => `calc((100% - ${($visibleItemsCount - 1) * 0.5}rem) / ${$visibleItemsCount})`};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .left-arrow-button,
  .right-arrow-button {
    position: absolute;
    z-index: 1;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    transition: all 300ms ease-in-out;
  }

  .left-arrow-button:hover,
  .right-arrow-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
  }

  .left-arrow-button:focus,
  .right-arrow-button:focus {
    outline: none;
  }

  .left-arrow-button {
    left: 24px;
  }

  .right-arrow-button {
    right: 24px;
  }


  @media (hover: none) and (pointer: coarse) {
    .left-arrow-button,
    .right-arrow-button {
      display: none;
    }
  }

  .indicator-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 auto;
    margin-top: 1.5rem;
    padding: 0 72px; /* Account for arrow buttons (48px + 24px margin each side) */
    -ms-overflow-style: none;
    /* hide scrollbar in IE and Edge */
    scrollbar-width: none;
    /* hide scrollbar in Firefox */
  }

  .indicator-container::-webkit-scrollbar,
  .indicator-container::-webkit-scrollbar {
    display: none;
  }

  .indicator-container {
    max-width: 56px;
    overflow: auto;
  }

  .indicator-container > * {
    margin-left: 6px;
    border-radius: 12px;
    transition-property: all;
    transition-duration: 250ms;
    transition-timing-function: linear;
  }

  .indicator-container > div:first-child {
    margin-left: 0px;
  }

  .indicator-container > .dots-active {
    width: 12px;
    height: 6px;
    background-color: #ffffff96;
    flex-shrink: 0;
    flex-grow: 1;
  }

  .indicator-container > .dots-close {
    width: 6px;
    height: 6px;
    background-color: #ffffff33;
    flex-shrink: 0;
    flex-grow: 1;
  }

  .indicator-container > .dots-far {
    width: 4px;
    height: 4px;
    margin-top: 1px;
    margin-bottom: 1px;
    background-color: #ffffff33;
    flex-shrink: 0;
    flex-grow: 1;
  }
`;
export default Carousel;
