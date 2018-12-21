# slu-research
Polly: A Command-Line Tool for EPSCoR Big Data Integration 

Student Authors: 	Alessio Scalingi and Waqar Muhammad
Advisors:		Flavio Esposito and Vasit Sagan


Datasets are often isolated, noisy, and with different formats; the Missouri Transect dataset collection is no exception. However, understanding climate change impacts on agriculture (e.g., predicting yield in various stress scenarios) requires integration of multiple dataset including remote sensing images, crop physiology data, and climate data. Unexperienced users mostly rely on proprietary Cloud platforms and data analysis tools such as Rapid-Miner, Weka or SPSS, which have limited functionalities and scale poorly. 
To this aim, we present Polly, a system designed with current technologies that allows data integration, processing and analytics in support of the research and teaching activities within the EPSCoR project. 
In particular, our system is designed to scale and it is composed by a Serverless architecture, a Cassandra NoSQL database, and with our API users may access a set of machine learning tools such as linear and support vector regression. We are testing Polly on a set of EPSCoR Plant Team datasets to answer a few representative data science questions. For example, we showed how to use Polly to run several regression models with the aim of estimating different biochemical and biophysical features (e.g., chlorophyll, nitrogen on leaves). 

