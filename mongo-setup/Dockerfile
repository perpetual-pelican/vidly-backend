# syntax=docker/dockerfile:1
FROM mongo:4.4.6
CMD bash -c "\
  sleep 1 && \
  mongo --host vidly_mongo1:27017 --eval \" \
    rs.initiate( \
      { \
        _id: 'vidly_rs', \
        members: [ \
          { \
            _id: 0, \
            host: 'vidly_mongo1:27017', \
            priority: 2 \
          }, \
          { \
            _id: 1, \
            host: 'vidly_mongo2:27017', \
            priority: 0 \
          }, \
          { \
            _id: 2, \
            host: 'vidly_mongo3:27017', \
            priority: 0 \
          } \
        ] \
      } \
    ); \
  \" \
"
