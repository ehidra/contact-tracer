# COVID-19 Contact Tracer


## Background

COVID-19 is a disease caused by SARS-CoV-2 virus. It emerged in China in late 2019, and in the space of several months it has become a global pandemic. The disease causes respiratory failure in the most critical (approx 4%) cases. 

Many countries have implemented lockdown measures to reduce the spread of the disease, and to alleviate pressure on their often overwhelmed health care systems. These measures appear to have been effective in China as, after several months in lockdown, it has now gone several days without recording any new locally transmitted infections. 

It is therefore hoped that the physical distancing measures other countries have put in place will also result in fewer new infections over the coming weeks and months.

Once the daily new infections subside, policy makers will then need to consider how they can start easing physical distancing restrictions to get their economies and societies moving again. The obvious risk of this is that the virus will come back.

Researchers at Oxford University have proposed building a ‘contact tracer’ mobile app to mitigate this: https://045.medsci.ox.ac.uk/mobile-app 
Contact Tracer App

The idea is to create a smart phone app which could replace classical contact tracing when new cases of the disease occur. It would be much quicker to respond (hours rather than days) and much more scalable than traditional methods, making it possible to recommend self-isolation and quarantine measures quickly and efficiently to those affected.  

The app could detect nearby devices or app users that it sees (possibly via Bluetooth, Wi-Fi Aware or similar) and record how long it came into contact with them. These could be stored in a local database on the device (better for scalability and privacy). 

If an app user reports that they have a suspected or confirmed case of COVID19, this would be synchronised with all other devices so that they can be notified if they came in contact with them. The app could then recommend actions based on how close you came, and how long you spent with them.

## Open Source Project

We would like to invite app developers from around the world to assist us in the creation of an open source implementation of such an app. 

### Requirements

The ideal app would be:

* Able to communicate peer to peer over BLE, Bluetooth or Wifi 
* Cross platform on Android and iOS
* Supported by as many devices as possible, but at least those 3-4 years old.
* Able to scan devices while offline, e.g. when travelling underground or in a remote area without Internet access.
* Able to run while in the background
* Free to distribute (software only preferable)

Initially we were planning to identify all devices nearby by their bluetooth MAC addresses, however we now realise this is not feasible as, for privacy reasons, they are hidden from app developers in iOS, also some devices with randomise their MAC address when communicating with others and we are not sure if it is possible for an app developer to access all the addresses that have been used. Our current thinking is to use Bluetooth Low Energy (BLE) to exchange information through Generic Access Profile (GAP) and/or Generic Attribute Profile Services (GATT).

We have already begun working on a prototype, and are evaluating the following options:

|Technology|Pros|Cons|
|----------|----|----|
|Bluetooth LE|Widely supported. No internet dependent. Hardware IDs available on Android. BLE Service Advertisement approach could work if we only want to track other app users. |iOS hides hardware addresses, and replaces them with a UUID only valid for your device. The mapping algorithm is not public. We may be able to use BLE to advertise a service amongst app users, but it’s unclear whether Android can discover iOS apps that are advertising in the background. |
|iBeacon - app based|Your phone can advertise a unique id given by the app itself and detect others|Advertise ID only works for IOS Android can only detect|
|Beacon - hardware based|Will work across devices and is used already.Beacon does the advertising and the App just monitors that your beacon is with you and looks for other beacons.|Extra configuration for the beacons and extra cost for the devices (probably will need to choose just one type of device)|
|WiFi Aware|||
|Nearby Connections API|Uses WiFI Aware and Bluetooth LE recognising devices around you|Only valid for Android
|Nearby Messages API|Valid for IOS and Android even though the connecting process is different of what we want for this|Needs internet connection|
|p2pkit|Seems to have a solution that has been tested already across IOS and Android|Not updated for 3 years Needs internet connection|
|MultipeerConnectivity|A framework for offline data transmission between Apple devices. Open source library available.| Maybe only runs while the app is in the foreground? iOS only.|
|Wifi Direct||Android only, not compatible with iOS."

We are primarily web app developers, so we are looking for engineers with experience in hardware communication who can help.

## Contributors

* Paul Maunders - UK 
* Carlos Morillo Merino - Spain

## The prototype (working for IOS and Android)

At the end we decided to go with the Buetooth LE approach and we have build a prototype.

We are using Ionic 4 + Capacitor for it . If you want to have a go this should get you up and running quickly.
We are relying heavily on this plugin https://github.com/randdusing/cordova-plugin-bluetoothle
There are some issues we have still to solve but it does work.

At the moment Background mode only work for Android but IOS should be also possible just have to iron it out.

git clone repository
npm install within the repo root
ionic capacitor run android
ionic capacitor run ios


The whole point of the app is being able to recognise and connect to other devices no matter the platform and exchange 
UUID's. Then that should prove two people have been in contact. We have still to improve the proccess testing the scans 
and advertise as peripheral cycles. The results are stored in a in-app SQLite data base.
