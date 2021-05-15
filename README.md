# Airbnb Clone

An Airbnb clone website built using the MEN Stack as a final project.

**Link to Site:** [https://cryptic-badlands-80510.herokuapp.com/](https://cryptic-badlands-80510.herokuapp.com/)

**Completed:** 11/30/2020

**Technologies Used:** Node.js, Pug, Express, MongoDB, Bootstrap


**Table of Contents**
* [Overview](#Overview)
* [Design](#Design)
* [Comments](#Comments)


## Overview
This was the first website I built that had full CRUD functionality and a working login system. The implementation was guided by requirements outlined in the assignment. 
The main requirements were:
1.	Home page with search form
2.	Sign-Up and Login component 
3.  Search for rooms
4.	User dashboard for the appropriate user
5.	Calculate total cost for room booking
6.	Book a room
7.	Allow admin to update their posted rooms

I separated users into 2 categories, admin and user. When an admin logs in, they are redirected to a personal dashboard that allows them to create new rooms and displays the rooms already created. Admins are unable to book their own rooms. Booking a room will display all booking details on a new page. On a more complete application, this action would send the user an email of the details instead. Only registered users can book rooms. 


## Design 
The website was designed under time constraints and so I opted for a more minimal approach. I used a combination of Bootstrap and CSS. The homepage consists of a room booking form, promotional cards, and a quick about us. This is not the most mobile friendly application, however, using CSS grid and flexbox, all components should be visible in smaller viewports. The Book Room and Update Room components were styled under the same class as Room Listings, which may look a bit weird but it’s still functional. Bootstrap was mainly used for warning signs and buttons. 


## Comments
This project was a good introduction to developing a full-stack application, and allowed me to learn about various technologies used to create a secure modern website (*probably not that secure but secure enough*).


Access to site:

**Admin**
* Email: admin2@email.com
* Password: Q!2w3e4r

**User**
* Email: basicuser@email.com 
* Password: Q!2w3e4r


