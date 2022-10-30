'use strict';

const config = require('./config');
const app = require('./app/app');

const PORT = process.env.PORT || 6000;

config.initDB()
    .then(msg => {
        console.log(msg);

        const server = app.listen(PORT, () => {
            console.log("Server started. Port: ", PORT);
        });
    })
    .catch(err => {
        throw(new Error(err));
    });

    const GraphQLClient = require('graphql-request').GraphQLClient

    const client = new GraphQLClient('http://localhost', {
      headers: {
        //Authorization: 'Bearer YOUR_AUTH_TOKEN',
        email: "test@mail.com",
        password: "mypassword"
      },
    });
    
    
    client.request(`
        {
          events{
            elements{
              uuid
               title
              category
              description
              endsOn
              beginsOn
              joinOptions
              onlineAddress
              physicalAddress{
                geom
                country
                region
                locality
                street
                postalCode
              }
              contacts{
                name
                summary
              }
            }
          }
        }
      `).then(events => console.log(events)).catch(err => console.log(err))