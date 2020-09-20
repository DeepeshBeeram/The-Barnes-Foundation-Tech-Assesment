# The Barnes Foundation - Tech Assessment


To develop the server locally, run npm install to install the needed packages. You can then use npm run dev. This command will start the server and automatically reload it when changes to the src have been made. Run "npm i pg" if you encounter a prompt to install it. I have added db.ts file to connect the database and also specify the username and password accordingly to make the API work.

List of end points:

1. http://localhost:3010/api/tickets This end point will GET all the available tickets.

2. http://localhost:3010/api/tickets/{id} This end point will GET a ticket based on given ticket ID. If the ticket Id is not found this will throw a bad request with status 400.

3. http://localhost:3010/api/events?memberOnly=&category=&name= This end point will GET all the events when there are no filter query parameters given. Based on the given query parameters of category, member_only, event name this API will return those particular events accordingly. This API will enable searching for events that have a given keyword in it's event name, enable filtering for events whose category falls within a list of requested event categories, filtering for events where the member_only field is true/false.

4. http://localhost:3010/api/events/{id} This end point will GET a event based on given event ID. If the event Id is not found this will throw a bad request with status 400.

5. http://localhost:3010/api/order This end point will POST a new order based on the conditions that the ticket quantity passed in the request body should not be more than the max_purchase value of the ticket type. 
{
    "customer_name": "Harvey",
    "event_id": 2,
    "ticket_type_id": 1,
    "ticket_quantity": 5
} 
The above JSON object is sent as a request body to place an order and when event_id or ticket_type_id exists and the ticket_quantity specified is less than the max_purchase of particular ticket type, the ID is calculated and is_member_purchase is set to true.
