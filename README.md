# Daniel Hendrix Frontend Take-Home Assignment

Welcome to my WorkOS Frontend Take-Home Assignment! This was built with [Vite](https://vite.dev/) and [Radix-UI Themes](https://www.radix-ui.com/).

## Getting Started

### Server Setup
  - Ensure you have the latest version of Node.js.
  - Run the following commands to install dependencies and start the API:
    ```bash
    cd server
    npm install
    npm run api
    ```

### Client Setup
  - Run the following commands to install dependencies and start the client:
    ```bash
    cd client
    npm install
    npm run dev
    ```

  - The application should now be running on your localhost at `http://localhost:5173/` but check your terminal to ensure you have the correct port.

### Some notes on what did not make it in
- I don't like the cursor states for the various buttons on the page. I think a cursor type of `pointer` should be happening but by default it's not doing that. With more time I would figure out why that's happening, and maybe it's intentional.
- Similarly to above, I don't like that the Buttons don't show an obvious visual change when they are disabled. This seems to be on purpose, and the hover state showing when they are disabled is great, but I would try to improve that.
- On the code side, my `store.ts` file got a bit big, with a few more state variables than I might like, and I would perhaps look at consolidating them to maybe objects with multiple properties or even split the store into multiple functional stores instead.
- There's not much in the way of nice slick CSS animations and with more time I would try to add some work there, for example maybe when removing a User, instead of a full reload the user could kind of nicely be removed from the view, etc.
- Instead of the blocky generic loading state for the table, I would implement a skeleton view or different skeleton views when the page is loading.
- In the Users table, the row height is slightly higher than spec. It wasn't immediately apparent what the correct fix was, and I moved on due to time constraints.