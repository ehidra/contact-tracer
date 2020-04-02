# COVID-19 Contact-Tracing Apps Tracker


## **Contact-Tracing App Projects**

* #### [Private Kit: Safe Paths](http://safepaths.mit.edu/)

	**Status**: Apps are live, backends and agency integrations in development

	**Technical synopsis**

	The Safe Paths app saves the user's GPS location data to a local encrypted store.

	* When a user tests positive, they can choose to give their location records to a health professional, who then manually redacts personally-identifiable information and publishes the redacted data to a public database.
	* The app downloads location data of infected cases from the public database to search against locally-stored location history

	* Questions:
		* Does Safe Paths have requirements for organizations/agencies/governments that it is integrating with? If so, how are the entities audited against those requirements?
		* How does the manual redaction process work?

* #### [CoEpi](https://www.coepi.org) | Community Epidemiology In Action

	**Status**: In development

	**Technical synopsis**

	The CoEpi app uses Bluetooth to record an anonymized list of close-proximity Interactions with other users.

	* In an Interaction, apps exchange temporary Contact-Event-Numbers (CEN). The other user's CEN is stored along with a timestamp for when the interaction occurred. Temporary CENs are deterministically generated from a cryptographic Key, which is private by default.
	* User can choose to upload their Key, along with symptoms, to a public database
	* The app downloads Keys and their associated Symptoms from the public database and searches local Interactions records to determine if any of the User's interactions were with symptomatic users
	* No location data is captured

* #### [COVID Watch](https://www.covid-watch.org)

	**Status**: In beta testing

	**Technical synopsis**

	* Similar to the CoEpi app, COVID Watch uses Bluetooth to record an anonymized list of close-proximity interactions with other users. The main difference is that rather than self-reporting symptoms, COVID Watch aims to validate diagnoses through confirmation from health agencies.
	* There are also plans to add an anonymised GPS heatmap.
	* Currently in the process of consulting with other contact tracing programs to develop common APIs and reusable modules, to speed up all efforts and benefit from network effects rather than a fragmented userbase.

* #### [TraceTogether](https://www.tracetogether.gov.sg/) (Singapore)

	> By using time-varying tokens, the app does keep
	the users private from each other. A user has no
	way of knowing who the tokens stored in their app
	belong to, except by linking them to the time the
	token was received. However, the app provides
	little to no privacy for infected individuals; after
	an infected individual is compelled to release their
	data, the Singaporean government can build a list
	of all the other people they have been in contact
	with.
	(https://arxiv.org/abs/2003.11511)





* [Hamagen](https://github.com/MohGovIL/hamagen-react-native): Israel's Ministry of Health's COVID-19 exposure prevention app
* [enigmampc/SafeTrace](https://github.com/enigmampc/SafeTrace)
* [corona-trace](https://corona-trace.github.io/) 

* [Corona Kavach](https://economictimes.indiatimes.com/tech/software/govt-likely-to-launch-covid-path-tracing-app/articleshow/74819186.cms): India Govt's tracing app
	* [Corona Kavach on Google Play](https://play.google.com/store/apps/details?id=com.cosafe.android)


## **Research, Analysis, and Design proposals**

* [Anonymous Retrospective Broadcasts](https://gist.github.com/hdevalence/fefba3153b30e60537e84f7d2551b295) ([Henry de Valence](https://github.com/hdevalenc))
* [Contact Tracing Mobile Apps for COVID-19: Privacy Considerations and Related Trade-offs](https://arxiv.org/abs/2003.11511) (Hyunghoon Cho, Daphne Ippolito, Yun William Yu)


