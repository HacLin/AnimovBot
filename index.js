const { Composer } = require('micro-bot');
const bot = new Composer;
const request = require('request');

bot.start((ctx) => {

    // console.log(ctx.message.from);
    // console.log(ctx.message.chat);
    ctx.reply('Welcome to the AnimeBot ' + ctx.message.chat.first_name);
    ctx.reply('<Usage>: /anime <anime-name>');
})


bot.help((ctx) => {

    // console.log(ctx.message.from);
    // console.log(ctx.message.chat);
    // ctx.reply('Welcome to the MoviesBot ' + ctx.message.chat.first_name);
    ctx.reply('<Usage>: /anime <anime-name>or<series-name>');
})

var Results = [];
var req = [];

bot.command('anime', (ctx) => {
    var anime_name = ' ';
    let page = 1;




    ctx.reply('///...Requesting Data From the Server...///');
    chatId = ctx.message.chat.id;
    console.log("Chat ID:" + chatId);
    let search = ctx.message.text.split(" ");
    // console.log(search);
    if (search.length == 1) {
        console.log("No Arguments Passed");
        ctx.reply("Kindly Follow The Procedure");
        ctx.reply("<Usage>: /anime <anime-name>");
    } else {

        // console.log(search);
        search.shift();
        anime_name = search.join(" ").toLowerCase();

        let temp = new Object();
        temp.anime = anime_name;
        if (!req.includes(temp))
            req.unshift(temp);
        console.log(req);
        // console.log(req.findIndex(x => x.anime = anime_name));

        function DataReceiver(page, search) {
            // console.log("Arguments Passed");

            // console.log(anime_name);
            console.log("Searching for " + anime_name + ` page:${page}`);
            ctx.reply("///...Searching for " + anime_name + ` page:${page}` + " in the server...///");
            // ctx.reply("///...Choose From The Options Below ...///");
            var api_call = `https://api.jikan.moe/v3/search/anime?q=${anime_name}&page=${page}`;
            console.log("Requesting Data as :" + api_call);
            const url_options = {
                    method: "GET",
                    url: api_call
                }
                // console.log(url_options);
            request(url_options, (error, response, body) => {

                if (!error) {
                    console.log("Data Received");
                    // console.log(Results.results);
                    //console.log(response);
                    // console.log(body);
                    var res = JSON.parse(body);
                    let temp = new Object();
                    temp.results = res;
                    Results.push(temp);
                    console.log(Results);

                    if (res.status == 404) {
                        ctx.reply(res.message + " Try Again Later!");

                    } else {
                        // console.log(Results);
                        // console.log(res); 
                        var choices = [];
                        // var keyboard = [];
                        let start = 0;
                        let stop = 10;


                        function keyboard_sender(start, stop) {
                            var keyboard = [];
                            var reply_message = `Loaded Page : ${page}` + '\n' + `Loaded Options : ${(page*50)-(50-stop)}`;

                            for (let i = start; i < stop; i++) {
                                choices[i] = new Object();
                                choices[i].Title = Results[req.findIndex(x => x.anime = anime_name)].results.results[i].title;
                                choices[i].Type = Results[req.findIndex(x => x.anime = anime_name)].results.results[i].type;
                                keyboard.push([{ text: choices[i].Title + ' : ' + choices[i].Type, callback_data: JSON.stringify(i) + '-' + JSON.stringify(page) + '-' + JSON.stringify(req.findIndex(x => x.anime = anime_name)) }]);

                            }

                            keyboard.push([{ text: "Load More", callback_data: "#" }]);
                            //console.log(keyboard);
                            ctx.reply(reply_message, {
                                reply_markup: JSON.stringify({
                                    inline_keyboard: keyboard

                                })
                            }).catch(err => console.log(err))
                            console.log("Options Sent to the Chat");
                            bot.on('callback_query', (cbd) => {
                                let cbdata = cbd.update.callback_query.data;
                                cbdata = cbdata.split("-");
                                console.log(cbdata);

                                if (cbdata == '#') {
                                    console.log("length of the callback _array = 2");
                                    cbd.deleteMessage(cbd.update.callback_query.message.id);
                                    console.log("keyboard deleted");
                                    // cbd.editMessageReplyMarkup().then(console.log("Loaded More Options")).catch(err => console.log(err))
                                    if (stop != 50) {
                                        stop += 10;
                                        console.log(req.findIndex(x => x.anime = anime_name));

                                        keyboard_sender(start, stop);

                                    } else {
                                        page += 1;
                                        keyboard_sender(start, stop);
                                        stop = 10;
                                        DataReceiver(page, search);

                                    }

                                } else if (cbdata.length == 3) {
                                    console.log("length of the callback_array = 3")
                                        // console.log(cbdata);
                                    let pageno = cbdata[1] - 1;
                                    let itemno = cbdata[0];
                                    let reqno = cbdata[2];
                                    console.log("Data Sent\nPage No:" + pageno + "\nItem No:" + itemno + '\nReq No:' + reqno);
                                    // console.log(Results[pageno].results[pageno].image_url);
                                    cbd.replyWithPhoto(Results[reqno].results.results[itemno].image_url, { caption: "\n\nTitle :" + Results[reqno].results.results[itemno].title + '\n\nType :' + Results[reqno].results.results[itemno].type + '\n\nEpisodes :' + Results[reqno].results.results[itemno].episodes + '\n\nAiring:' + Results[reqno].results.results[itemno].airing + '\n\nRating :' + Results[reqno].results.results[itemno].score + '\n\nRated :' + Results[reqno].results.results[itemno].rated + '\n\n\n\n For more info visit the link:\n' + Results[reqno].results.results[itemno].url + '\n@AniList' })
                                        .catch(err => console.log(err));


                                }

                            })
                        }

                        keyboard_sender(start, stop);


                    }







                } else {
                    console.log(error);

                }



            });

        }
        DataReceiver(page, search);
    }



});

// bot.launch();
module.exports = bot;