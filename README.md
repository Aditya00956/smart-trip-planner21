# Smart Trip Planner

# SMARTTOUR

## Intelligent Cloud-Based Tourism Recommendation and Trip Planning System

### Project Type

University-level Cloud Computing / Cloud Strategy Project

### Project Objective

Build a **production-quality, cloud-based Tourism Recommendation and Trip Planning System** called **SmartTour**.

The system must solve a real-world tourism problem by helping users discover suitable tourist destinations, compare attractions, understand weather and distance conditions, generate personalized recommendations, automatically create itineraries, optimize routes, estimate trip costs, and save their trips.

The project MUST demonstrate strong and visible integration of:

* Cloud Computing

* Cloud Strategy Concepts

* Maps

* External APIs

* Cloud Database

* Cloud Authentication

* Cloud Storage

* Serverless Computing

* Recommendation Algorithms

* Intelligent Automation

* Security

* Scalability

* Professional UI/UX

* Testing and Performance Evaluation

This is NOT supposed to be a simple CRUD tourism website.

The application must demonstrate how cloud computing, APIs, maps, recommendation logic, and intelligent automation can work together to solve a real-world problem.

---

# 1. REAL-WORLD PROBLEM

Tourists often need to manually search multiple websites and applications to decide:

* Where to go

* Which attractions match their interests

* How far attractions are from each other

* Which places fit their budget

* Whether weather conditions are suitable

* How to arrange attractions across multiple days

* Which route is most efficient

* How much the trip may cost

This creates fragmented and time-consuming trip planning.

SmartTour should solve this problem by creating a **single intelligent tourism platform** that combines tourism data, Maps, weather, routing, cloud computing, and personalized recommendations.

---

# 2. TARGET USERS AND STAKEHOLDERS

### Primary User

Tourist / Traveler

### Secondary Stakeholders

* Tourism businesses

* Hotels and restaurants

* Local tourism authorities

* System administrator

* API providers

* Cloud service provider

The system architecture and requirements should clearly explain how each stakeholder benefits.

---

# 3. PROJECT OBJECTIVES

The system should:

1. Provide personalized tourism recommendations.

2. Integrate a real Maps API.

3. Integrate real external APIs.

4. Provide location-based recommendations.

5. Consider user interests.

6. Consider travel budget.

7. Consider weather conditions.

8. Calculate distance and travel time.

9. Automatically generate itineraries.

10. Optimize travel routes.

11. Store user trips in the cloud.

12. Provide secure authentication.

13. Provide responsive and accessible UI.

14. Scale using cloud services.

15. Provide monitoring and logging.

16. Handle API failures gracefully.

17. Provide meaningful recommendation explanations.

18. Demonstrate cloud strategy concepts from the syllabus.

---

# 4. TECHNOLOGY STACK

Use the following architecture unless there is a strong technical reason to change it.

## Frontend

* React

* Vite

* TypeScript

* Tailwind CSS

* React Router

* Modern component architecture

## Backend

* Node.js

* Express.js

* TypeScript

* REST APIs

## Cloud

Prefer AWS.

Use:

* Amazon Cognito → Authentication

* AWS Lambda → Serverless backend functions

* API Gateway → Backend API gateway

* DynamoDB → Cloud database

* Amazon S3 → Storage

* CloudFront → CDN / frontend delivery

* CloudWatch → Monitoring and logs

* IAM → Security and permissions

## External APIs

Integrate at minimum:

### 1. Maps API

Use Google Maps Platform or Mapbox.

### 2. Places/Tourism API

Use Google Places API or another legitimate places API.

### 3. Weather API

Use OpenWeather or another legitimate weather API.

### 4. Routing/Distance API

Use Google Routes API, Mapbox Directions, or another appropriate routing service.

Do not hard-code API responses.

---

# 5. MANDATORY MAPS FUNCTIONALITY

The Maps integration must be a core feature.

The map must support:

* Destination search

* Current/selected location

* Tourist attraction markers

* Recommended-place markers

* Restaurant markers

* Hotel markers

* Nearby-place search

* Distance calculation

* Route calculation

* Estimated travel time

* Multiple destinations

* Directions

* Itinerary route visualization

When a marker is clicked, display:

* Place name

* Category

* Rating

* Description

* Distance

* Estimated travel time

* Opening hours if available

* Weather

* Recommendation score

* Add to Trip

* Get Directions

The map must update dynamically based on user selections.

---

# 6. EXTERNAL API INTEGRATION

The application must use APIs through the backend wherever private credentials are involved.

## Places API

Retrieve:

* Tourist attractions

* Restaurants

* Museums

* Historical locations

* Parks

* Hotels

* Ratings

* Coordinates

* Opening hours where available

## Weather API

Retrieve:

* Temperature

* Weather condition

* Humidity

* Wind

* Forecast

Weather information must influence recommendations.

## Routing API

Retrieve:

* Distance

* Travel time

* Route

* Route geometry where available

Do not merely display API data.

Use API results inside the recommendation and itinerary logic.

---

# 7. CLOUD STRATEGY IMPLEMENTATION

Clearly map the project to cloud strategy concepts.

The documentation must include a dedicated **Cloud Strategy Mapping** section.

Demonstrate:

### Cloud Computing

Tourism services are delivered through cloud infrastructure.

### SaaS

Users access SmartTour through a web browser without installing the application.

### Serverless Computing

AWS Lambda handles backend functions without requiring manual server management.

### Scalability

Serverless architecture and managed cloud services allow the system to handle changing demand.

### Elasticity

Resources can scale according to workload.

### Cloud Storage

Amazon S3 stores application assets and permitted uploaded content.

### Cloud Database

DynamoDB stores users, trips, preferences, favorites, and recommendation information.

### Cloud Security

IAM, Cognito, HTTPS and environment/secret management protect resources.

### Monitoring

CloudWatch monitors errors, requests, execution and application health.

### Pay-as-you-go

Cloud resources can be consumed according to usage.

Include a table mapping every relevant syllabus concept to its implementation.

---

# 8. CLOUD DEPLOYMENT MODEL

Use:

**Public Cloud Deployment Model**

Preferred platform:

**Amazon Web Services (AWS)**

Explain why public cloud is suitable:

* Global accessibility

* Scalability

* Managed services

* Availability

* Reduced infrastructure management

* Flexible resource usage

* Pay-as-you-go model

---

# 9. SYSTEM ARCHITECTURE

Implement the following logical architecture:

```text

                         USER

                           |

                           v

              +-------------------------+

              | React / Vite Frontend   |

              | Responsive Web App      |

              +-----------+-------------+

                          |

                          v

              +-------------------------+

              | Amazon CloudFront       |

              +-----------+-------------+

                          |

                          v

              +-------------------------+

              | API Gateway             |

              +-----------+-------------+

                          |

                          v

              +-------------------------+

              | AWS Lambda              |

              | Backend Services        |

              +-----------+-------------+

                          |

          +---------------+----------------+

          |               |                |

          v               v                v

     Places API      Weather API       Maps API

          |               |                |

          +---------------+----------------+

                          |

                          v

              +-------------------------+

              | Recommendation Engine   |

              +-----------+-------------+

                          |

                          v

              +-------------------------+

              | DynamoDB                |

              | Users / Trips / Data    |

              +-------------------------+

                          |

                          v

              +-------------------------+

              | Amazon S3               |

              | Cloud Storage           |

              +-------------------------+

              CloudWatch → Monitoring

              IAM → Authorization

              Cognito → Authentication

```

Create a professional architecture diagram based on this structure.

---

# 10. USER AUTHENTICATION

Implement secure authentication.

Users should be able to:

* Register

* Login

* Logout

* Reset password

* Manage profile

* Update preferences

Prefer Amazon Cognito.

Never store plain-text passwords.

Never expose private credentials in frontend source code.

---

# 11. USER PROFILE AND PREFERENCES

Allow users to configure:

### Interests

* History

* Culture

* Nature

* Beaches

* Adventure

* Food

* Shopping

* Religious places

* Museums

* Family activities

### Preferences

* Budget

* Travel distance

* Number of days

* Preferred transportation

* Preferred activity type

* Indoor/outdoor preference

These preferences must be used by the recommendation engine.

---

# 12. INTELLIGENT RECOMMENDATION ENGINE

Create a transparent recommendation algorithm.

Calculate a recommendation score using:

```text

Recommendation Score =

Interest Match        30%

Distance              20%

Rating                15%

Budget Compatibility  15%

Weather Suitability   10%

Popularity            10%

```

Make weights configurable.

Normalize all values before calculating the final score.

Return:

```text

Place

Match Score

Reason

Distance

Rating

Estimated Cost

Weather Suitability

```

Example:

```text

Fort Kochi

92% Match

✓ Matches History interest

✓ Matches Culture preference

✓ Within budget

✓ 3.2 km from selected location

✓ Good weather conditions

✓ Highly rated

```

---

# 13. INNOVATIVE FEATURES

The project must go beyond minimum requirements.

Implement the following intelligent features.

## A. Weather-Aware Recommendation

If weather is unsuitable for outdoor activities, prioritize indoor attractions.

Example:

```text

Rain expected

        ↓

Reduce beach/park ranking

        ↓

Increase museum/shopping/cultural attraction ranking

```

## B. Budget-Aware Recommendation

Prioritize destinations that fit the user's budget.

## C. Smart Itinerary Generation

Automatically generate a day-by-day itinerary.

## D. Route Optimization

Arrange attractions in an efficient order using distance and travel time.

## E. Explainable Recommendations

Show users why a destination was recommended.

## F. Dynamic Nearby Recommendations

Use the selected/current location to retrieve nearby attractions.

---

# 14. SMART ITINERARY GENERATOR

User enters:

```text

Destination

Starting Location

Number of Days

Budget

Interests

Travel Preferences

```

System generates:

```text

DAY 1

09:00 AM

Historical Attraction

11:30 AM

Museum

01:00 PM

Lunch

03:00 PM

Cultural Attraction

06:00 PM

Restaurant

```

The itinerary must consider:

* Opening hours

* Distance

* Travel time

* Weather

* User interests

* Budget

* Number of days

Display the itinerary route on the map.

---

# 15. TRIP COST ESTIMATION

Estimate:

* Transportation

* Food

* Entry fees

* Accommodation if applicable

* Other expenses

Example:

```text

Estimated Transportation: ₹1,200

Food: ₹1,500

Entry Fees: ₹600

Other: ₹700

Total Estimated Cost: ₹4,000

User Budget: ₹5,000

Remaining Budget: ₹1,000

```

Clearly label estimates as estimates.

---

# 16. PROFESSIONAL UI/UX

The application must NOT look like a basic student CRUD project.

Design a modern tourism platform.

### Pages

1. Landing Page

2. Login

3. Register

4. Dashboard

5. Destination Search

6. Recommendations

7. Interactive Map

8. Trip Planner

9. Trip Details

10. Favorites

11. Profile

12. Admin Dashboard

### Dashboard should show

* Welcome message

* Search destination

* Recommended places

* Weather

* Upcoming trip

* Saved destinations

* Recent activity

---

# 17. RESPONSIVE DESIGN

The application must work properly on:

* Desktop

* Laptop

* Tablet

* Mobile

Use responsive breakpoints.

Maps must remain usable on small screens.

Navigation must transform appropriately for mobile.

---

# 18. ACCESSIBILITY

Follow accessibility best practices.

Implement:

* Proper semantic HTML

* Keyboard navigation

* Visible focus states

* Accessible buttons

* Form labels

* Appropriate contrast

* Alt text for meaningful images

* ARIA attributes where appropriate

* Error messages that are understandable

---

# 19. ADMIN DASHBOARD

Create an admin dashboard.

Display:

* Total users

* Total searches

* Most searched destinations

* Most recommended destinations

* Number of saved trips

* API request statistics

* Application errors

* Popular categories

Use charts for meaningful statistics.

---

# 20. DATABASE DESIGN

Create the following collections/tables.

### Users

```text

userId

name

email

preferences

budget

interests

createdAt

```

### Destinations

```text

destinationId

externalApiId

name

category

description

latitude

longitude

rating

estimatedCost

```

### Trips

```text

tripId

userId

destination

startDate

endDate

budget

estimatedCost

itinerary

createdAt

```

### Favorites

```text

favoriteId

userId

destinationId

createdAt

```

### Recommendations

```text

recommendationId

userId

destinationId

score

reason

createdAt

```

---

# 21. BACKEND REST API

Implement:

```text

POST /api/auth/register

POST /api/auth/login

GET /api/destinations/search

GET /api/destinations/:id

GET /api/places/nearby

GET /api/weather/:location

GET /api/routes

GET /api/recommendations

POST /api/recommendations/generate

POST /api/trips

GET /api/trips

GET /api/trips/:id

DELETE /api/trips/:id

POST /api/favorites

GET /api/favorites

DELETE /api/favorites/:id

```

Add:

* Authentication middleware

* Validation

* Error handling

* Rate limiting where appropriate

* Logging

---

# 22. API SECURITY

Store secrets using cloud secret/environment configuration.

Example:

```text

MAPS_API_KEY=

PLACES_API_KEY=

WEATHER_API_KEY=

AWS_REGION=

DATABASE_CONFIG=

AUTH_CONFIG=

```

Never commit secrets to GitHub.

Create:

```text

.env.example

```

with placeholder values only.

---

# 23. ERROR HANDLING

The application must gracefully handle:

* Invalid destination

* API timeout

* Maps API failure

* Weather API failure

* Places API failure

* No attractions found

* Network failure

* Invalid user input

* Unauthorized request

* Expired authentication

* Database failure

* API rate limits

Example:

Instead of:

```text

500 Internal Server Error

```

show:

> "We couldn't retrieve weather information right now. Your recommendations are still available using other factors."

---

# 24. API FALLBACK STRATEGY

If one external API becomes unavailable:

* Do not crash the entire application.

* Return partial results where possible.

* Display an understandable warning.

* Log the failure.

* Continue using available recommendation factors.

For example:

```text

Weather API unavailable

        ↓

Recommendation Engine

        ↓

Use:

Interest

Distance

Rating

Budget

Popularity

        ↓

Generate recommendation

```

---

# 25. PERFORMANCE

Optimize:

* API calls

* Database queries

* Map loading

* Image loading

* Frontend bundle

* Recommendation calculations

Use:

* Lazy loading

* Caching where appropriate

* Pagination

* Debounced search

* API response caching where appropriate

* Efficient database queries

Avoid unnecessary API requests.

---

# 26. TESTING REQUIREMENTS

Create a comprehensive testing strategy.

### Unit Testing

Test:

* Recommendation score

* Budget calculations

* Distance calculations

* Validation functions

* Itinerary generation

### Integration Testing

Test:

```text

Frontend

 ↓

Backend

 ↓

External API

 ↓

Database

```

### UI Testing

Test:

* Login

* Search

* Map

* Recommendations

* Trip creation

* Favorites

* Responsive layouts

### Security Testing

Test:

* Unauthorized access

* Invalid authentication

* API key exposure

* Invalid requests

### Performance Testing

Measure:

* Page load time

* API response time

* Recommendation generation time

* Database response time

---

# 27. EDGE-CASE TESTING

Explicitly test:

| Scenario                | Expected Behavior             |

| ----------------------- | ----------------------------- |

| Invalid destination     | Friendly error                |

| No attractions          | Informative empty state       |

| Weather API unavailable | Continue recommendations      |

| Maps API unavailable    | List-based fallback           |

| Internet disconnected   | Offline/error message         |

| ₹0 budget               | Low-cost/free recommendations |

| Empty interests         | General recommendations       |

| Very large distance     | Distance warning              |

| Expired session         | Redirect to login             |

| Invalid API response    | Graceful handling             |

| Duplicate favorite      | Prevent duplicate             |

| Invalid trip dates      | Validation error              |

---

# 28. PERFORMANCE EVALUATION

Document actual measurements.

Create a performance report containing:

```text

Average page load time

Average API response time

Average recommendation generation time

Database response time

Map loading time

Error rate

```

Compare performance before and after optimization where possible.

---

# 29. AI-ASSISTED DEVELOPMENT

Use AI-assisted coding tools such as:

* Cursor AI

* GitHub Copilot

* ChatGPT

* Antigravity

* Bolt.new

* Lovable

* Replit AI

Maintain an **AI Development Log**.

For every major AI-assisted task record:

```text

Tool

Prompt

Generated Code

Modification Made

Testing Performed

Result

```

Example:

```text

Task:

Recommendation Engine

AI Tool:

Cursor AI

Prompt:

Create a weighted recommendation algorithm based on

interest, distance, rating, budget and weather.

Generated:

Initial recommendation function.

Developer contribution:

Modified weighting system and added weather factor.

Testing:

Tested 20 sample destinations.

Result:

Passed.

```

IMPORTANT:

Do not blindly accept AI-generated code.

Understand, review, modify and test all generated code.

---

# 30. GIT VERSION CONTROL

Use Git.

Maintain meaningful commits such as:

```text

Initial project setup

Create React frontend

Implement authentication

Add Maps integration

Add Places API

Add Weather API

Create recommendation engine

Implement itinerary generator

Add cloud database

Add admin dashboard

Add testing

Fix API error handling

Optimize performance

Prepare deployment

```

---

# 31. DOCUMENTATION

Generate complete project documentation.

Include:

## Chapter 1 – Introduction

* Background

* Problem

* Motivation

* Objectives

## Chapter 2 – Existing System

Explain limitations of traditional/manual tourism planning.

## Chapter 3 – Proposed System

Explain SmartTour.

## Chapter 4 – Requirements

Functional and non-functional requirements.

## Chapter 5 – Cloud Strategy

Map syllabus concepts to implementation.

## Chapter 6 – Architecture

Include:

* System architecture

* Cloud architecture

* Data flow

* API flow

## Chapter 7 – Database Design

Include ER diagram.

## Chapter 8 – Implementation

Explain:

* Frontend

* Backend

* APIs

* Maps

* Recommendation engine

* Cloud

## Chapter 9 – Testing

Include test cases and results.

## Chapter 10 – Performance

Include measurements.

## Chapter 11 – Security

Explain:

* Authentication

* Authorization

* IAM

* API security

* Secret management

## Chapter 12 – Results

Show screenshots and successful workflows.

## Chapter 13 – Future Scope

Discuss:

* AI chatbot

* Machine learning recommendation model

* Real-time traffic

* Flight/train integration

* Hotel booking

* Dynamic pricing

* Social recommendations

---

# 32. REQUIRED DIAGRAMS

Generate professional diagrams for:

1. System Architecture

2. Cloud Architecture

3. Deployment Architecture

4. Use Case Diagram

5. Data Flow Diagram – Level 0

6. Data Flow Diagram – Level 1

7. ER Diagram

8. Sequence Diagram

9. API Integration Flow

10. Recommendation Engine Flow

11. AWS Service Architecture

---

# 33. DEMONSTRATION SCENARIO

The application must have a complete demonstration workflow.

Use **Kochi, Kerala** as the default demonstration destination.

Example:

```text

User logs in

      ↓

Selects Kochi

      ↓

Selects:

History + Culture + Food

      ↓

Budget:

₹5,000

      ↓

Duration:

3 Days

      ↓

Places API retrieves attractions

      ↓

Weather API retrieves forecast

      ↓

Maps API retrieves coordinates

      ↓

Routing API calculates distance/time

      ↓

Recommendation Engine calculates scores

      ↓

System generates recommendations

      ↓

System creates 3-day itinerary

      ↓

Route displayed on map

      ↓

User saves trip

      ↓

Trip stored in cloud database

```

The complete workflow should be demonstrable during the final presentation.

---

# 34. SAMPLE RECOMMENDATION OUTPUT

Example:

```text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORT KOCHI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

92% Match

Category:

History + Culture

Rating:

4.6/5

Distance:

3.2 km

Estimated Cost:

₹300

Weather:

Suitable

Why recommended?

✓ Matches your interests

✓ Within your budget

✓ Highly rated

✓ Close to your location

✓ Suitable weather

[View on Map]

[Get Directions]

[Add to Trip]

```

---

# 35. CLOUD STRATEGY JUSTIFICATION

The documentation must explain WHY each service is selected.

Example:

### AWS Lambda

Chosen because:

* Serverless

* Automatically scales

* No server management

* Suitable for API-driven workloads

### DynamoDB

Chosen because:

* Managed NoSQL database

* Scalable

* Low operational overhead

* Suitable for user/trip data

### S3

Chosen because:

* Durable cloud storage

* Scalable

* Suitable for static assets

### CloudFront

Chosen because:

* Faster content delivery

* CDN

* Reduced latency

### Cognito

Chosen because:

* Managed authentication

* Secure user identity management

Do not simply list services. Explain their architectural purpose.

---

# 36. RELIABILITY REQUIREMENTS

The system should:

* Avoid single points of failure where practical.

* Handle API failures.

* Validate inputs.

* Log backend errors.

* Monitor cloud services.

* Protect database access.

* Provide meaningful fallback behavior.

The application should continue operating in a degraded mode when a non-critical external API fails.

---

# 37. FINAL QUALITY REQUIREMENTS

The completed application must be:

* Functional

* Secure

* Responsive

* Scalable

* Accessible

* Modular

* Maintainable

* Well documented

* Properly tested

* Cloud deployed

* API integrated

* Map integrated

* Visually professional

Do not leave major features as mockups or placeholders.

Do not hard-code fake API results unless a clearly documented development fallback is required.

Do not use fake cloud integrations.

---

# 38. FINAL DELIVERABLES

The final project must contain:

```text

✓ Working React frontend

✓ Working backend/serverless APIs

✓ Cloud authentication

✓ Cloud database

✓ Cloud storage

✓ Cloud deployment

✓ Maps integration

✓ Places API

✓ Weather API

✓ Routing API

✓ Recommendation engine

✓ Smart itinerary generator

✓ Budget estimator

✓ Weather-aware recommendations

✓ Route optimization

✓ Favorites

✓ User profile

✓ Admin dashboard

✓ Monitoring

✓ Error handling

✓ Responsive UI

✓ Accessibility

✓ Unit tests

✓ Integration tests

✓ API tests

✓ Edge-case testing

✓ Performance testing

✓ Security implementation

✓ Git repository

✓ AI development log

✓ Architecture diagrams

✓ ER diagram

✓ Use case diagram

✓ DFD

✓ API documentation

✓ Cloud strategy mapping

✓ Final project documentation

```

---

# 39. DEVELOPMENT ORDER

Build the project in the following order:

### Phase 1

Project architecture and repository setup.

### Phase 2

Frontend UI and routing.

### Phase 3

Authentication.

### Phase 4

Cloud database.

### Phase 5

Backend/serverless APIs.

### Phase 6

Maps integration.

### Phase 7

Places API integration.

### Phase 8

Weather API integration.

### Phase 9

Routing integration.

### Phase 10

Recommendation engine.

### Phase 11

Smart itinerary generator.

### Phase 12

Budget estimator.

### Phase 13

Favorites and user profile.

### Phase 14

Admin dashboard.

### Phase 15

Security.

### Phase 16

Error handling and fallback mechanisms.

### Phase 17

Testing.

### Phase 18

Performance optimization.

### Phase 19

Cloud deployment.

### Phase 20

Documentation and diagrams.

---

# 40. IMPORTANT DEVELOPMENT RULES

1. Do not create a superficial demo.

2. Do not hard-code recommendations.

3. Use real APIs.

4. Use a real Maps integration.

5. Use cloud services meaningfully.

6. Keep API secrets secure.

7. Implement proper authentication.

8. Validate all user input.

9. Handle API failures.

10. Test every major feature.

11. Document AI-assisted development.

12. Explain generated code.

13. Keep frontend and backend modular.

14. Use Git version control.

15. Optimize API usage.

16. Make the interface responsive.

17. Follow accessibility practices.

18. Make recommendations explainable.

19. Demonstrate scalability.

20. Ensure the final project directly satisfies every evaluation criterion.

---

# 41. SUCCESS CRITERIA

Consider the project complete only when all of the following can be demonstrated:

```text

REAL-WORLD PROBLEM

        ↓

CLEAR REQUIREMENTS

        ↓

CLOUD STRATEGY

        ↓

PROFESSIONAL ARCHITECTURE

        ↓

SECURE CLOUD DEPLOYMENT

        ↓

MAPS + APIs

        ↓

INTELLIGENT RECOMMENDATION

        ↓

AUTOMATIC ITINERARY

        ↓

PROFESSIONAL UI/UX

        ↓

INNOVATIVE FEATURES

        ↓

TESTING + VALIDATION

        ↓

PERFORMANCE EVALUATION

        ↓

RELIABLE WORKING APPLICATION

```

build this site and try to use Glassmorphism

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smart-trip-planner21.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/67ef2c3e-9d50-4023-86c6-715e9c3be819).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
