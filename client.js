const url =
  "wss://tunjay-h-code50-38299274-4rxjx6x7cj6gg-8080.githubpreview.dev/";
let socket = new WebSocket(url);

socket.onopen = function (e) {
  console.log("[open] Connection established");
  console.log("Sending to server");
  // socket.send(JSON.stringify({action: "NEW_MESSAGE", data: 'salam 12345'}));

  let userID = localStorage.getItem("userID");
  if (!userID) {
    socket.send(
      JSON.stringify({ event: "USER_CONNECTED", data: { isNewUser: true } })
    );
  } else {
    socket.send(
      JSON.stringify({
        event: "USER_CONNECTED",
        data: { isNewUser: false, userID: userID },
      })
    );
  }
};

socket.onmessage = function (envelope) {
  let message = JSON.parse(envelope.data);
  console.log(`[message] Data received from server: ${envelope.data}`);

  if (message.event === "NEW_USER_UUID") {
    localStorage.setItem("userID", message.data.uuid);
  } else if (message.event === "NEW_MESSAGE") {
    let msgDiv = document.createElement("div");
    msgDiv.classList.add("message-from-others", "test-border");
    msgDiv.innerText = `from: ${message.data.from}\n${message.data.message}`;

    document.getElementById("all_messages").append(msgDiv);
    document.getElementById("all_messages").scrollTop =
      document.getElementById("all_messages").scrollHeight;
  }
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log("[close] Connection died");
  }
};

socket.onerror = function (error) {
  console.log(`[error] ${error.message}`);
};

// html events
let inputMessage = document.getElementById("input_message");
let buttonSendMessage = document.getElementById("btn_send_message");

// Execute a function when the user releases a key on the keyboard
inputMessage.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("btn_send_message").click();
  }
});

buttonSendMessage.addEventListener("click", (event) => {
  socket.send(
    JSON.stringify({
      event: "NEW_MESSAGE",
      data: {
        message: inputMessage.value,
        from: localStorage.getItem("userID"),
      },
    })
  );

  let msgDiv = document.createElement("div");
  msgDiv.classList.add("message-from-me", "test-border");
  msgDiv.innerText = `from: ${localStorage.getItem("userID")}\n${
    inputMessage.value
  }`;

  document.getElementById("all_messages").append(msgDiv);
  document.getElementById("all_messages").scrollTop =
    document.getElementById("all_messages").scrollHeight;

  inputMessage.value = "";
});
