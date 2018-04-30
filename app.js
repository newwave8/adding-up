'use strict';
const fs = require('fs');
const readline = require('readline'); //readlineは改行で勝手に区切って一行ずつ実行してくれる仕組み
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const map = new Map(); // key: 都道府県 value: 集計データのオブジェクト
/*
rlオブジェクトでlineというイベントが発生(1行読めたらイベント発生)したらこの無名関数を呼んでください、という意味。
無名関数の処理の中でconsole.logを使っているので、lineイベントが発生したタイミングで、
コンソールに引数lineStringの内容が出力されることになる。
このlineStringには、読み込んだ1行の文字列が入っている。
*/
rl.on('line', (lineString) => {
    const columns = lineString.split(','); //文字列の組み込み関数　split関数(引数＝何で区切って配列にするか)
    const year = parseInt(columns[0]); //parseInt()は文字列を整数値に変換する関数
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    if (year === 2010 || year === 2015) {
        let value = map.get(prefecture);
        if (!value) { //!value => not value つまりundifinedを返す、false
            value = {
                popu10: 0, //popu10,popu15は0で初期化しないと整数を「+=」で足し合わせることができない
                popu15: 0,
                change: null
            };
        }
        /*
        csvファイルを一行ずつ読んでいる。2010年を男女があるので２回読み込むことになる。
        2010年の男性が来たときに　value.pupu10 += popu;　で男性の人口が足される。
        次に、2010年の女性が来たときに　value.pupu10 += popu;　で女性の人口が足される。
        したがって、2010年の男女の人口が求めることができる。
        */
        if (year === 2010) {
            value.popu10 += popu; // x += y => x = x + yという意味
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }
});
rl.resume();
rl.on('close', () => {
    for (let pair of map) { // 変数pairは配列が入っている。[0]=>keyである都道府県名,[1]=>valueである集計オブジェクト chromeのconsoleで確認する。
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(map).sort((pair1, pair2) => { //動画01:32:31から
        // sortは内部的にソートアルゴリズムが用意されていてそのAPIを利用する
        // 降順（大きい順）
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map((pair) => {
        return pair[0] + '; ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率:' + pair[1].change;
    });
    console.log(rankingStrings);
});