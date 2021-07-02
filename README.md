# Skyslackers
Team: the Skyslackers

Level of Achievement: Apollo

**This is the repository for the game. 
For repository of our server, please go to https://github.com/yuejunfeng0909/Skyslackers_server**

## Setup procedure for users
**Mac**
1. Unzip the compressed zip file. Open the folder.
2. Right-click on "skyslackers_server_mac" and select "Open". First-time users may need to go to system preferences - security & privacy - general to allow the computer to open the executable.
3. Use your phone to scan the QR code and open the webpage in the browser, preferably Safari or Chrome. Make sure that your phone is in the same Wifi with your computer.
4. Tap "Get Accelerometer Permission" and select "Allow".
5. Wait until the game is opened. If the system says the game cannot be trusted, right-click on "Skyslackers" in the same directory and select "Open", and select "Open" to trust the game.
6. Click “Start” and select a song from song1, song2 and song3 (listed in increasing difficulty).
7. During the game, if you want to pause or change the settings, press “esc” on your keyboard.
8. Enjoy the game!

**Windows**
1. Unzip the compressed zip file. Open the folder.
2. Right-click on “skyslackers_server_win” and select “Open”. First-time users may need to adjust windows firewall settings in the pop-up window: make sure the “public” box is ticked, or the server may fail to operate.
3. Use your phone to scan the QR code and open the webpage in the browser, preferably Safari or Chrome. Make sure that your phone is in the same Wifi with your computer.
4. Tap "Get Accelerometer Permission" and select "Allow".
5. Wait until the game is opened. 
6. Click “Start” and select a song from song1, song2 and song3 (listed in increasing difficulty).
7. During the game, if you want to pause or change the settings, press “esc” on your keyboard.
8. Enjoy the game!


## Motivation
We are fans of Star Wars and we love lightsabers because they are cool. We are also music lovers. So we want to make a super cool game that combines lightsabers and music. Moreover, instead of using a keyboard or mouse, we want to control our lightsaber by holding it physically, which feels more real.


## Project Scope
One sentence: 
We want to make a motion sensor game in which we will combine lightsaber fighting and music together to give players a totally new Jedi experience.

Detailed: 
We want to develop a motion-sensing music video game. In the game, players can use their “lightsaber” (their smartphones) to deflect blaster bolts from the Dark Side. To make our game more exciting and interesting, we integrate rhythm-matching game features into our game: in order to deflect the blaster bolts successfully, players need to match the rhythm of the background music. After every successful deflection, scores will be awarded. By matching the rhythm perfectly, players get “Combos” and extra scores. Scores and leaderboards will be displayed after every round to motivate players.
	
	
## Proposed features
1. The position and the movement of the virtual lightsaber is synchronized with the user’s phone (both IOS and Android supported).
2. When a new round starts, there will be blaster bolts coming towards the player, and the player can wave his/her phone to control the virtual lightsaber blade to           deflect. If successfully deflected, scores will be awarded. 
3. The incoming blaster bolts will change colour when they come near to the player, green - god - green - red. When the player deflects the bolt when it is green, he/she only gets “good” deflection. When he/she deflects the bolt when it is gold, he/she gets “perfect”deflection and higher scores will be awarded.
4. When the player achieves “perfect” deflections consecutively, he/she gets “Combos” and additional scores are awarded.
5·. There are real-time updates of scores and “Combos” during the game.
6. After each round of the game, the total score will be displayed and there is a leaderboard showing the global rank of the player.
7. The background music and the pattern of incoming blaster bolts is customisable. Players can choose to play their favourite songs and design their own blaster bolt patterns for greater challenge and fun.
8. Two-player mode for more interesting gaming experience.
9. An online database that stores all the maps available (a map includes the song itself and specifically designed blaster bolt pattern) with different levels of difficulty. Players can choose maps they like to play with.
10. A complementary program that helps players to make their own maps.. Players can either manually design the blaster bolt pattern or let the program randomly generate patterns. 
11. Easy set-up.


## Plan (timeline)
**Milestone 1**
1. Achieve motion data transfer from the phone to the computer - week 1/2
2. Achieve data transfer from server to Unity - week 3

**Milestone 2**
1. Construct main scenes & game object models - week 4/5
2. Create scripts for collision detection, score & combo calculation - week 6
3. Create map builder and find songs, write script for spawning bolts, testing and debugging - week7

**Milestone 3**
1. Construct database using mySQL (tentative) and try to set up register/login for users - week8
2. Add new features: uploading/downloading maps; add map builder for users - week9
3. Add two-player mode - week10
4. Add better graphics + sound effects - week11


## Features achieved (for milestone 1)
1. Secure and real-time data transfer of iphone motion data to macbook
2. Use phone to control the lightsaber on laptop screen


## Technology used (for milestone1)
1. web server (using “express” JavaScript package)
2. Web API: DeviceMotionEvent in html file running on the phone: obtains real-time device motion and orientation 
3. Websocket using self-created local ssl certificate to achieve secure communication between the html file running on the phone and the server on the laptop (using “ws” JavaScript package)
4. Non-secure websocket that transfer data from server to Unity3D game (both the server and game project are on laptop)


## Core features achieved (for milestone 2)
1. Scenes of the game are created. Game objects like the lightsaber and blaster bolts are well-modelled. 
2. Achieved collision detection between the lightsaber and bolts. When the lightsaber hits the bolts in green or gold, “good” or “perfect” will be shown. If the lightsaber fails to hit the bolts, “miss” will be shown. Corresponding scores will be added to the total score.
3. Added speed detection to the lightsaber: only if the lightsaber hits bolts in a relatively high speed will the bolts be deflected. 
4. Added bolts spawning script. Incoming blaster bolts can therefore appear and move to the correct place at correct timing as designed. 
5. Added Start Menu. Three options are available: “Play”, “Settings” and “Exit”.
6. Added Setting Page. Players can adjust volume, bolt speed and time delay.
7. Added three maps(songs) in increasing levels of difficulty. Players can choose the song after they click “Play” in the Start Menu. **(All songs used are Creative Common licensed resources which give us the right to share, use and build upon the work created by the authors.)**
8. Added total score and Combo display
9. Added summary page displaying total scores after the game
10. Easy set-up: bundled all javascript files and packages into executables for both Mac OS and Windows OS. Added QR code generating function for easy connection from the phone to the computer. Automatically open the game after connecting the phone to the computer.
11. Wider compatibility: Phone: fully compatible with IOS and Android; Computer: compatible with Mac (only x86 architecture) and Windows (only x86 architecture). M1 Mac or ARM-based Windows PC are sadly not supported.


## Technology used (for milestone 2)
1. Unity: set up game scenes, integration of game objects, scripts and sound effects, graphics design
2. C# scripts in Unity: design the logic of the game
3. Blender: modelling game objects
4. JavasScript Packages: Pkg - A JavaScript package that bundles all JavaScript files and packages into an executable for Mac/Windows; qrcode - generate the QR code linking to a given url; applescript - used to automatically open the game on Mac; child_process - used to automatically open the game on Windows


## Features to be achieved in Milestone 3
1. Online database that supports players’ upload or download of maps(songs).
2. Two-player mode: can connect two phones (Player 1 and Player 2)
3. Add in more game objects (lightsaber from the enemy, different kinds of blaster bolts) to make the game more fun
4. Design a program that helps players to customise their own maps/songs
5. Improve on graphics and sound effects


## Prototype Testing

**Tested items and corresponding methods of testing**
1. Testing the communication between the phone and the computer: firstly, to check if the JavaScript (to obtain accelerometer data) in HTML is running correctly, web inspector of Safari and console.log() were used to see the real-time data update. Moreover, to check if the websocket transferred data correctly from our phone to the server running on our computer, console.log() was again used on our computer to check if there was any motion data update.
2. Testing the communication between server and Unity: Debug.Log() was in Unity C# scripts to check the real-time data transferred to Unity. Moreover, in Milestone 1, a cylinder object was created in Unity and the phone motion data obtained from the server was used to control the movement of the cylinder. By observing that the motion of our phone synchronised with the motion of the cylinder, the communication between server and Unity was proven to be successful.
3. Testing the game scripts: Debug.Log() was used in Unity to check real-time values of parameters in the Unity console.
4. Testing graphic/sound effects and overall gaming experience: Unity provides the “play” function that enables us to preview the game without building the game file. “play” was used most of the time but there were cases in which “play” failed because of inaccurate timing (possibily due to different ways of rendering between “play” and “build”). In such cases, the game was directly built in Unity and then we played it to check the effects.
5. Testing JavaScripts bundling and executable generating: we tried to open the Mac/Win executables on their respective environments to check if they can run properly and open the game automatically.
6. Testing game quality: to check if there is inaccurate timing/delay in songs and the blaster bolts, or if maps were badly designed, or if there were hidden bugs, we played the game many times from beginning to end and put ourselves into the players’ shoes and thought of scenarios like pausing, quitting to Main Menu and choosing another song… All those scenarios were tested to ensure that no bugs exist.

**Testing standards**
1. Successful connection between the phone and the computer
2. Successful connection between the server and Unity
3. Executables can set up servers and establish connections above successfully and open the game automatically when the player’s phone is connected to the server
4. The game has no obvious bugs: no problems in entering all scenes; no problems in the game logic (collision detection, lightsaber position synchronisation, score and Combo calculation and setting adjustment)
5. The game brings the player pleasant gaming experience: good graphics/sound effect and tolerable delay

**Testers and their feedback**
1. Game developers: tested every part of this game. We think that this game has great graphic design and sound effects. It was very exciting and fun to play this game as the songs chosen and maps created fit with each other. The control of the lightsaber is smooth. Moreover, the game was easy to set up. Just open one file, the server and the game will start automatically. However, we also think that the game can be more interesting if more modes of playing can be added. Probably can add more interactive features in the future.

2. Friends of game developers: mainly tested on JavaScripts bundling and executable generating and game graphic design. According to them, executables (both Mac and Win versions) were working on their computers and no bug was observed. Moreover, it was very simple to set up the game. The QRcode feature was really convenient. They also thought that the explosion effect and the lightsaber motion effect were really cool. However, they also pointed out that the number of maps/songs they can choose from is quite limited.

**Problems encountered & solution**
1. Unable to fetch device’s sensor data without secure communication: since it was more to set up secure communication, an insecure communication firstly set up between an iphone and a Macbook to test its workability. However,  it was found that the DeviceMotionEvent API does not return any data on iphone. An error message indicated that IOS devices only grant permission to access sensor data under secure communication. Hence, secure communication was necessary. SSL certificates were then used to establish secure communication between the phone and the computer.
2. Mismatch between background music and blaster bolts: When testing our maps (songs), we found that there is always delay between background music and blaster bolts. Blaster bolts in our game are like music scores and they should match with the song. Such mismatch greatly undermined our gaming experience. We firstly thought that it was the “play” function that led to the delay since “play” only let us preview the game without complete building. However, after building the game and testing, it was found that delays still existed in built games. Hence, we guessed that it was our method of spawning the blaster bolts one by one that caused this problem. This method involves functions that request for game time frequently which may bring in accumulated time delay. We changed to a new method of generating all blaster bolts at once to reduce the delay. We also added adjustable delay compensation in our setting to solve this problem.
3. Low FPS(frame per second): due to large-size models being used, our game had very low FPS of around 20. The lightsaber was not responsive and lagging was observed. The overall gaming experience was not smooth. Low FPS cannot be tolerated in rhythm-matching music games. To increase the FPS, we simplified some of our models. Now the FPS is around 60.

**Plan for further testing (user testing) in Milestone 3**
1. Number: favourably at least 10 to ensure the feedback can be away from personal bias and can reflect the opinions of the general public towards our game. Large number of users also help us to debug.
2. User platforms: 
IOS device + Windows PC 
IOS device + MacBook (x86 Architecture)
Android device + Windows PC
Android device + MacBook (x86 Architecture)
3. Time: release updates and collect feedback every week
