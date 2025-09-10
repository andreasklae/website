import React from 'react'

const Tag = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '' 
}) => {
  const baseClasses = 'font-mono inline-flex items-center'
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-sm'
  }
  
  const variantClasses = {
    default: 'bg-ide-accent-blue/20 text-ide-accent-blue rounded-full',
    purple: 'bg-ide-accent-purple/20 text-ide-accent-purple rounded-full',
    green: 'bg-green-500/20 text-green-400 rounded-full',
    orange: 'bg-orange-500/20 text-orange-400 rounded-full',
    red: 'bg-red-500/20 text-red-400 rounded-full'
  }
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}

export default Tag
