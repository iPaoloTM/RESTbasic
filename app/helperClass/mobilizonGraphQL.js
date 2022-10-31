 
const GraphQLClient = require('graphql-request').GraphQLClient

const client = new GraphQLClient('http://0.0.0.0:4000/api', {
    headers: {
        email: "test@mail.com",
        password: "mypassword"
    },
});


module.exports.getEvents = () =>{
    return client.request(`
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
        `)
  }