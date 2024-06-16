Setting Up OBS for !playclip 'clip link' Command:

    Create a Browser Source:
        Open OBS and add a new Browser Source:
            Right-click in the Sources box.
            Choose Add → Browser.
            Name it something like "Twitch Clip Player".

    Configure Browser Source:
        In the properties of the Browser Source:
            Set the URL to any valid URL (it will be updated programmatically by your bot).
            Adjust Width and Height to match your scene layout.
            Ensure Shutdown source when not visible is unchecked (if you want it to continue playing when not shown).

    Connect OBS to OBS WebSocket:
        Make sure OBS WebSocket is installed and running:
            Download and install OBS WebSocket plugin from obs-websocket (make sure it matches your OBS version).
            Launch OBS. Go to Settings → Advanced → Plugins.
            Verify that OBS WebSocket plugin is listed and enabled.

    Configure OBS WebSocket:
        In OBS, go to Settings → Advanced → Network.
        Ensure the OBS WebSocket server settings match your local setup:
            Address: localhost:4444 (default unless you changed it).
            Password: By default, this is blank (""). If you set a password, enter it here.

    Bot Integration:
        Your Twitch bot (using TMI.js or similar) should now be able to connect to OBS WebSocket and send commands to update the URL of the Browser Source based on the !playclip command received in Twitch chat.

Example Commands and Integration:

    Twitch Bot: Handles !playclip 'clip link' commands, extracts the clip link, and calls a function to update the OBS Browser Source URL via OBS WebSocket.

    OBS WebSocket: Listens for commands from your bot and updates the Browser Source URL dynamically.