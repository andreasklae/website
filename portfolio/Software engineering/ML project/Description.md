## Description (en)
During my exchange semester at Freie Universität Berlin, I had the incredible opportunity to dive deep into the fascinating world of machine learning and drug discovery. Our research project tackled one of the most challenging problems in modern medicine: predicting how different drugs work together to fight diseases.

The question we set out to answer was both complex and critical: can we use artificial intelligence to predict drug synergy—when two drugs combined are more effective than the sum of their individual effects? This isn't just an academic exercise; it's potentially life-saving research that could revolutionize how we discover new treatments.

**What we built:**  
We developed and extensively evaluated GraphSynergy, a sophisticated graph neural network (GNN) that learns from protein-protein interaction networks to predict drug combinations. Think of it as teaching a computer to understand the intricate web of biological interactions and use that knowledge to predict which drug pairs might work better together.

Our approach was comprehensive: we analyzed massive datasets containing over 70,000 drug combination samples from DrugCombDB and 4,000 from Oncology Screen. We didn't just run the models—we dissected every aspect, from data distribution patterns to outlier analysis, cross-validation strategies, and even graph topology effects.

**The research journey:**  
What made this project particularly exciting was our systematic approach to understanding not just if the model worked, but why. We discovered that the synergy scores were normally distributed (a good sign for data quality), tested various outlier removal strategies, and found that extreme cases weren't errors but genuine biological phenomena. We implemented leakage-free cross-validation and experimented with different graph manipulation techniques to understand how network structure affects predictions.

**Technical deep dive:**  
We used PyTorch for model implementation, performed extensive hyperparameter tuning with Bayesian optimization, and compared our graph-based approach against traditional machine learning methods like Random Forest. The project involved sophisticated data preprocessing, feature engineering, and statistical analysis of prediction patterns.

**My role:**  
Working alongside international teammates Kerem Aras, Julian Hesse, and Felix Trau, I contributed to the comprehensive evaluation framework, data analysis pipeline, and model performance assessment. This was my first major foray into bioinformatics and graph neural networks, and I learned how different machine learning in life sciences is from traditional software applications—the stakes are higher, the data is more complex, and the interpretability requirements are crucial.

**Impact:**  
Our research provides valuable insights into the effectiveness of graph-based approaches for drug synergy prediction and offers a thorough evaluation framework that future researchers can build upon. The work contributes to the growing field of AI-assisted drug discovery, potentially accelerating the development of more effective combination therapies.

**Project Repository:**  
[View the GraphSynergy research project on GitHub](https://github.com/julianhesse/GraphSynergy_Swp)

Credits:  
- Andreas Klæboe (me)
- Kerem Aras - International teammate  
- Julian Hesse - International teammate
- Felix Trau - International teammate
- Freie Universität Berlin - Exchange semester host university

## Description (no)
Under utvekslingssemesteret mitt ved Freie Universität Berlin fikk jeg den utrolige muligheten til å dykke dypt ned i den fascinerende verdenen av maskinlæring og legemiddeloppdagelse. Forskningsprosjektet vårt tok tak i et av de mest utfordrende problemene innen moderne medisin: å forutsi hvordan forskjellige legemidler fungerer sammen for å bekjempe sykdommer.

Spørsmålet vi skulle besvare var både komplekst og kritisk: kan vi bruke kunstig intelligens til å forutsi legemiddelsynergi—når to legemidler kombinert er mer effektive enn summen av deres individuelle effekter? Dette er ikke bare en akademisk øvelse; det er potensielt livredende forskning som kunne revolusjonere hvordan vi oppdager nye behandlinger.

**Det vi bygde:**  
Vi utviklet og evaluerte omfattende GraphSynergy, et sofistikert graf-nevralt nettverk (GNN) som lærer fra protein-protein-interaksjonsnettverk for å forutsi legemiddelkombinasjoner. Tenk på det som å lære en datamaskin å forstå det intrikate nettet av biologiske interaksjoner og bruke den kunnskapen til å forutsi hvilke legemiddelpar som kan fungere bedre sammen.

Tilnærmingen vår var omfattende: vi analyserte massive datasett som inneholdt over 70 000 legemiddelkombinasjonsprøver fra DrugCombDB og 4 000 fra Oncology Screen. Vi kjørte ikke bare modellene—vi dissekerte hvert aspekt, fra datadistribusjonsmønstre til outlier-analyse, kryssvalidering-strategier og til og med graf-topologi-effekter.

**Forskningsreisen:**  
Det som gjorde dette prosjektet spesielt spennende var vår systematiske tilnærming til å forstå ikke bare om modellen fungerte, men hvorfor. Vi oppdaget at synergiskårene var normalfordelt (et godt tegn for datakvalitet), testet ulike outlier-fjerningsstrategier, og fant at ekstreme tilfeller ikke var feil, men ekte biologiske fenomener. Vi implementerte lekkasje-fri kryssvalidering og eksperimenterte med forskjellige graf-manipulasjonsteknikker for å forstå hvordan nettverksstruktur påvirker prediksjoner.

**Teknisk dykk:**  
Vi brukte PyTorch for modellimplementering, utførte omfattende hyperparameter-tuning med Bayesiansk optimalisering, og sammenlignet vår graf-baserte tilnærming mot tradisjonelle maskinlæringsmetoder som Random Forest. Prosjektet involverte sofistikert dataforbehandling, feature engineering og statistisk analyse av prediksjonsmønstre.

**Min rolle:**  
Sammen med internasjonale teammedlemmer Kerem Aras, Julian Hesse og Felix Trau bidro jeg til det omfattende evalueringsrammeverket, dataanalyse-pipeline og modell-ytelsesevurdering. Dette var mitt første store inntrykk i bioinformatikk og graf-nevrale nettverk, og jeg lærte hvor forskjellig maskinlæring innen livsvitenskap er fra tradisjonelle programvareapplikasjoner—innsatsen er høyere, dataene er mer komplekse, og tolkbarhetskravene er avgjørende.

**Påvirkning:**  
Forskningen vår gir verdifulle innsikter i effektiviteten av graf-baserte tilnærminger for legemiddelsynergi-prediksjon og tilbyr et grundig evalueringsrammeverk som fremtidige forskere kan bygge videre på. Arbeidet bidrar til det voksende feltet AI-assistert legemiddeloppdagelse, og kan potensielt akselerere utviklingen av mer effektive kombinasjonsterapier.

**Prosjektrepository:**  
[Se GraphSynergy-forskningsprosjektet på GitHub](https://github.com/julianhesse/GraphSynergy_Swp)

Bidragsytere:  
- Andreas Klæboe (meg)
- Kerem Aras - Internasjonal teammedlem  
- Julian Hesse - Internasjonal teammedlem
- Felix Trau - Internasjonal teammedlem
- Freie Universität Berlin - Vertsuniversitet for utvekslingssemester
