# Skyslackers
Team: the Skyslackers

Level of Achievement: Apollo

## Motivation
We are fans of Star Wars and we love lightsabers because they are cool. We are also music lovers. So we want to make a super cool game that combines lightsabers and music. 

## Project Scope
(one sentence version) We want to make a motion sensor game in which we will combine lightsaber fighting and music together to give players a totally new Jedi experience.

(longer descriptive version) We hope to develop a motion-sensing music video game. In the game, players can use their lightsaber to deflect blaster bolts and even lightsaber blades from the Dark Side. To make our game more exciting and interesting, we integrate Rhythm-matching games features: every time the player deflects the blaster bolts and lightsaber blades from the enemy, a music score will be produced. Hence, music is generated in response to the player's actions. Moreover, there will be scores and leaderboards after every round to motivate players.

## Proposed features
1. When the lightsaber is connected to the computer, the position and the movement of the virtual lightsaber is synchronized with the physical lightsaber hilt.
2. When a new round starts, there will be blaster bolts/lightsaber blades of different colours and lengths coming towards the player, and the player can wave the lightsaber hilt to control the virtual lightsaber blade to deflect. If successfully deflected, a music score will be produced and a new score will be updated. When the player successfully deflected 5/10/15… times consecutively, additional points will be awarded.
3. After each round of the game, the total score will be displayed and there is a leaderboard showing the global rank of the player.
4. There will be a forum for players to share experience and feedback

## Features achieved (as of Milestone 1)
1. Use iPhone gyroscope to control the lightsaber in the game

## Technology used (as of Milestone 1)
1. Unity3D Engine
1. Communication: Node.JS, HTML, JavaScript, WebSocket
2. APIs used: iPhone API

## How to Setup (only on Mac as of Milestone 1)
Run the server:
Create your own certificate for secure communication between your iphone and the laptop so as to transfer the motion sensor data to your laptop securely:
Mkcert is recommended: install mkcer following instructions in its github page
In the same folder with server.js and Use mkcert to create a key and certificate using your laptop ip address.
In server.js, change the ip address to your own laptop ip address.

Before running server.js, you need to install some packages in the directory where server.js is located in:
You need to install the express package. Open a terminal, navigate to the correct directory, run the following command in the terminal: npm i express. 
You also need to install the ws package by inputting the following command in the terminal: npm i ws (in the same directory).
Now you can run server.js by typing in node server.js in the terminal. 

Access the html on your iphone to collect data:
Open a browser on your phone (Safari or Chrome)
In the address bar, key in https://<your ip address>:8000 (for example, https://172.20.10.5:8000)
There will be a webpage loaded with a button “Get Accelerometer Permissions”. Click the button and there is a pop-up asking you whether you allow the webpage to access motion and orientation. Click “Allow”.

Set up Unity
Install Unity.
Open the unity game file

Play with your phone! Rotate your phone to control the orientation of the lightsaber in the game.
