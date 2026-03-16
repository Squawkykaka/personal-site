#import "@preview/tdtr:0.5.1": *

// #set page(
//   numbering: "1",
//   fill: color.rgb(255, 0, 0)
// )
// // #set text(fill: color.rgb())



Must be a paywalled gaming site.
- make it so the client cannot cheat into accessing the game
- must be a turn based multiplayer game
- wait for enough people
- develop so that turn based code is in seperate module.

= Firestore Database layout (V1)

#figure(
  tidy-tree-graph(compact: false)[
    - *root*
      - games
        - COIN COLLECTION
          - highscore
        - GTN
          - lobbies
            - lobbyid
              - guesshistory
                - random id
                  - number
                  - userRef
                  - username
      - users
        - userid
          - private
            - address
            - real name
            - email
            - age
          - displayname
          - gamesWon

    // -
  ],
  caption: [V1 of the firebase database layout],
)

== Lobbys
The benifit of having lobbies stored as a random id, then a subcollection
of guess history means that previous guesses can easily be displayed
and i can use firestores built in filtering features instead of making
my own.

The lobby id can  be hashed and have mathematical operations applied on it,
so that we have an unknown game id. This means players cannot cheat
and copy the answer

== Users
users can be stored in a collection, each user is stored under a randomly
generated id. public information is stored in that root node, and private
information is stored in a subcollection with rules meaning only the user
themselves and the admin can access.

== Firebase Database Layout (V2)
#figure(
  tidy-tree-graph(compact: false)[
    - *root*
      - games
        - COIN COLLECTION
          - highscore
        - GTN
          - lobbies
            - lobbid
              - guesshistory
                - random id
                  - number
                  - userRef
                  - username
              - joinRequests
                - random id
                  - usernameRef
                  - user id

      - users
        - userid
          - private
            - address
            - real name
            - email
            - age
          - displayname
          - gamesWon

    // -
  ],
  caption: [V2 of the firebase database layout],
)

The changes in this version is the addition of firebase roles for lobby owners.
The lobby owner will be able to get requests to join the game, the code that
people use to enter the game will be the lobby id.

The *list* permission on the lobby list will be disabled meaning
users cannot attempt to join random lobbys

Each specific user who is accociated with a lobby will be given a role
which means they can *append* to the guess list. The only user with permission to add
roles to users will be the lobby owner, who will have a master role
allowing other roles to be added.

Joining games will be facilitated by the joinRequests subcollection on a lobby
the owner *and* will listen on the collection for new elements, and the user
will listen on the specific document. When the document is appended the owner will
get a popup saying a user is requesting to join the lobby, and they can approve or deny
that request. Approval is done by adding the role to the requesting user, and deleting
the request, and disaproval is done by deleting the request

#pagebreak()

== Firebase Database Layout (V3)
This version removes the roles based system and replaces it with an api running
on a personal server. This means more validation is possible. This is done as
the role system isnt powerfull enough to manage users, and would be more
technically challenging to use

#figure(
  tidy-tree-graph(compact: false)[
    - *root*
      - games
        - COIN COLLECTION
          - highscore
        - GTN
          - lobbies
            - lobbid
              - answer
              - owner: userRef
              - guesshistory
                - random id
                  - number
                  - userRef
                  - username
              - members
                - userid
                  - user ref
              - joinRequests
                - random id
                  - user ref

      - users
        - userid
          - private
            - address
            - real name
            - email
            - age
          - displayname
          - gamesWon
  ],
  caption: [V3 of the firebase database layout],
)

=== Request workflow
1. user creates a request under `joinRequests`
2. owner recieves a popup allowing them to choose whether to let them in.
  1. if approved, the owner creates a new document under members
    with the user id of the requesting user as the id, and a reference
    to the user. the original request is set to `{ "approved" = true }`
  2. the user has a listener on its member doc, and when it gets an update
    the webpage loads the lobby as permissions now let it in.
  3. if disallowed the request is set to `{ "approved" = false }` and
    the user is alerted of this.

This specific method means that no trust needs to be given to untrusted clients.

=== Lobby creation workflow
1. a user makes an `add` request to the lobbies collection.
  this contains a owner field referencing thier user id.
  there are rules so they can only make lobbys for themselves
  this request also contains the randomly generated answer.
2. the owners website displays the lobby id, and they can send
  this code to other users to let them join it.

== Firebase Database Layout (V4)
This version uses more validation and runs on a trusted-host architecture where the owner of a lobby is the only one able to cheat, and any host has to requst the owner in order to add content.

The guess submitted workflow will start with a user adding a doc to the guessRequests collection. this will look like
```json
{
  "number": "the number that the user is guessing",
  "userID": "reference to the user submitting the guess"
}
```
database rules can actually validate to make sure userID is the correct id.



This version is where i also realised that i forgot about turn management when i was laying out the database so this version contains those requirements.

#figure(
  tidy-tree-graph(compact: false)[
    - *root*
      - games
        - COIN COLLECTION
          - highscore
        - GTN
          - lobbies
            - lobbyid
              - answerHashed
              - owner: userRef
              - currentTurn: userRef

              - createdAt: timestamp
              // dont need guessRequests due to the fact the turn order is manages and the clients can know whos turn it currently is
              - guesshistory
                - random id
                  - number
                  - ownerRef

              - members
                - userid
                  - user ref
              - joinRequests
                - random id
                  - user ref
  ],
  caption: [V4 of the firebase database lobby layout],
)

Due to the database schema getting larger, i am splitting the user info into a seperate tree, but it is still under the root node.

#figure(
  tidy-tree-graph()[
    - users
      - userid
        - private
          - address
          - real name
          - email
          - age
        - displayname

        - gamesWon
        - gamesLost
  ],
  caption: [The user info],
)

=== Permisions
owner needs to have delete permisson for entire lobby so they can
delete the game when it is done

=== Local
the owner can manage approving and denying login requests, as the owner has write permission to the joinRequests + members list

= Programming
i wanted to integrate the game site into one of my other sites, so some code is spread around. all relavent code is contained inside the `src/games` directory so that should be the only directory judged to the standards. all other code is irrelevant

= Journal
== Day 2
i setup firebase and added signing in automatically whenever the page is loaded, if you arnt signed in it gives you a prompt