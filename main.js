const http = require("http");
const fs = require("fs");


const host = 'localhost';
const port = 3000;


const server = http.createServer(function (rick, roll) {
    let contentHeader =
        {
            "Content-Type": "text/html; charset=utf-8"
        };
    roll.writeHead(200, contentHeader);

    let result = fs.readFileSync("chat.html");
    roll.write(result);
    let message = '';
    switch (rick.url) {
        case "/":
            rick.on("data", function (data) {
                message += data;
            });
            rick.on("end", function () {
                console.log(message);
                let elements = message.split("&");
                let allMessages = JSON.parse(fs.readFileSync("messages.json"));
                for (let i = 0; i < elements.length; i++) {
                    let element = elements[i];
                    let elementData = element.split("=");
                    if (elementData[0] === "messg") {
                        let messageBody = elementData[1].replace("+", " ");
                        allMessages.push(decodeURI(messageBody));
                        fs.writeFileSync("messages.json", JSON.stringify(allMessages));
                    }
                }
                roll.write('<div id="comm">\n');
                for (let i = 0; i < allMessages.length; i++) {
                    if (allMessages[i] !== "") {
                        roll.write('<div class="comments">');
                        roll.write('<div class="comment dialog">');
                        roll.write('<p>' + allMessages[i] + '</p>');
                        roll.write('</div>');
                        roll.write('</div>');
                    }

                }


                result = fs.readFileSync("chat2.html");
                roll.end(result);
            });
            break;
        case "/edit":

            rick.on("data", function (data) {
                message += data;
            });
            rick.on("end", function () {
                let allMessages = JSON.parse(fs.readFileSync("messages.json"));
                let messageBody = '';
                let messageID = -1;
                let elements = message.split("&");
                for (let i = 0; i < elements.length; i++) {
                    let element = elements[i];
                    let elementData = element.split("=");
                    if (elementData[0] === "messg") {
                        messageBody = decodeURI(elementData[1].replace("+", " "));
                    }
                    if (elementData[0] === "id") {
                        messageID = elementData[1];
                    }
                }
                if (messageID >= 0) {
                    console.log(allMessages);
                    allMessages[messageID] = messageBody;
                    console.log(allMessages);
                    if (messageBody === '') {
                        allMessages = allMessages.filter(function (value) {
                            return value !== '';
                        });
                        console.log(allMessages);
                    }
                    fs.writeFileSync("messages.json", JSON.stringify(allMessages));
                }
                for (let i = 0; i < allMessages.length; i++) {
                    if (allMessages[i] !== "") {
                        roll.write("<form method='post'>");
                        roll.write("<input type='hidden' value='" + i + "' name='id'>");
                        roll.write('<textarea class="messageform" name="messg">' + allMessages[i] + '</textarea>');
                        roll.write('<button type="submit">Кринж</button>');
                        roll.write("</form>");
                    }
                }
                roll.end("</body></html>");
            });

            break;
        default:
            roll.end("404 страница не найдена");
    }

}).listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});