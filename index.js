require("dotenv").config();
const request = require("request");
let lastMovieId = null;

async function checkUser () {
    // https://frontendapi.twitcasting.tv/users/{userId}/latest-movie で取得できる
    let lastedMovieResult = await requestPromise({
        url: `https://frontendapi.twitcasting.tv/users/${process.env.USER_ID}/latest-movie?__n=${new Date().getTime()}`,
        json: true,
        method: "GET"
    });
    if (!lastedMovieResult.movie) return; // 配信を一度も行っていない場合は、movieがnullになる。
    if (lastMovieId == lastedMovieResult.movie.id) return; // 前回も同じライブを処理した場合は無視する。
    lastMovieId = lastedMovieResult.movie.id; // 最後に取得したmovieIdを記録する。
    if (!lastedMovieResult.movie.is_on_live) return; // 今ライブを行っていなければ無視する。
    // DiscordのWebHookにPOSTする。
    await requestPromise({
        url: process.env.DISCORD_URL,
        json: {
            content: `🔴 ツイキャスで配信が始まりました！ https://twitcasting.tv/${process.env.USER_ID}/movie/${lastedMovieResult.movie.id}`
        },
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        }
    });
}

setInterval(checkUser, 4000);

function requestPromise (param) {
    return new Promise((resolve, reject)=>{
        request(param, function (err, res, body) {
            if(err){
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}