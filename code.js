function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');

  // ------------------------------制御用変数
  let wakeup_time = 6;  // 起きる時間（0時か～■時の間は「寝ています」というメッセージをﾃﾞﾌｫﾙﾄのに表示する
  let yotei_color = ['#00855294', '#001f8594', '#83850094', '#50008594'];  // 予定につける色（半透明にすることで重なった時にわかりやすい）
  let yotei_border_color = ['#008552', '#001f85', '#838500', '#500085'];
  template._lastName = '梶岡';  // 苗字
  template._firstName = '響'; // 下の名前（こっちは空白にしてOK）
  // ------------------------------------------------------------メッセージ設定（上部）
  let shujitsu_str = '終日予定あり';  // 終日予定がある日付の下に表示される文字
  let message_list = ['おそらく暇です',
                      '寝ています（夜更かししていなければ...）',
                      '何かしらの予定が入っています',
                      '大学の講義中です',
                      'バイト中です',
                      '就活に関する予定が入っています'];



  // ------------------------------html記述　240427_0030
  // ★htmlのbodyタグの中にstyleタグを作り、その中でないと埋め込みができないため、<?!= style ?>　と　<?!= style ?> 変数を用意しておく。
  template.style = '<style>';
  template._style = '</style>';

  // field_calendar => timeline => time
  var _time = '';
  for(let i=0; i<24; i++){
    _time += '<div class="time" id="t' + i + '"><p>' + i + ':00</p></div>';
  }
  template._time = _time;

  // field_calendar => day => time_day
  var _time_day = '';
  for(let i=0; i<24; i++){
    _time_day += '<div class="time_day"></div>';
  }
  template._time_day = _time_day;
  // ------------------------------
  // ------------------------------現在時刻にラインを引く

  // 現在時刻取得
  var dt = new Date();
  var now_Y = String(dt.getFullYear());
  var now_M = ('0' + (dt.getMonth() + 1)).slice(-2);
  var now_D = ('0' + dt.getDate()).slice(-2);
  var now_h = ('0' + dt.getHours()).slice(-2);
  var now_m = ('0' + dt.getMinutes()).slice(-2);
  var now_s = ('0' + dt.getSeconds()).slice(-2);
  var now_w = String(dt.getDay());
  const youbi = ['日', '月', '火', '水', '木', '金', '土'];
  var now_str = now_Y + '年  ' + now_M + '月 ' + now_D + '日（' + youbi[now_w] + '） ' + now_h + '時 ' + now_m + '分';  // now_wが文字列型でも上手く曜日が使えた
  let now_str_s =  now_Y + '年  ' + now_M + '月 ' + now_D + '日（' + youbi[now_w] + '）' + now_h + '時 ' + now_m + '分 ' + now_s + '秒';  // 秒まで付けた（スプシ用）
  Logger.log(now_str);
  template._now_str = now_str;

  // 現在時刻を基に、赤線の位置を調整
  let keisu01 = (Math.round((Number(now_m) / 60) * 10) / 10) + Number(now_h);     // ←*10 /10 で小数何桁まで丸めるか　10なら第2位を、100なら第2位を四捨五入
  var _css01 = '';
  _css01 += '#now {';
  _css01 += 'border-top: 3px solid #ff0000;';
  _css01 += 'width: 100%;';
  _css01 += 'position: absolute;';
  _css01 += 'top: calc(((100% / 24) - 0px) * ' + keisu01 + ');';   // -1pxのせいでズレて他っぽい？
  _css01 += 'z-index: 997;';
  _css01 += '}';
  template._css01 = _css01;

  // 時間に合わせてデフォルトメッセージを変える
  if(Number(now_h) < wakeup_time){
    template._message = message_list[1];
  }else{
    template._message = message_list[0];
  }

  // ------------------------------------------------------------↓アクセスカウント
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("アクセスログ");
  // 既にあるログを一つ上にずらす
  let logs = sheet.getRange(2, 1, 29, 1).getValues(); // 2~29行を取得（2次元配列）
  sheet.getRange(1, 1, 29, 1).setValues(logs);
  // 最新のログを書き込む
  let newData = [[now_str_s]];  // ただの文字列なので2次元配列に
  sheet.getRange(30, 1, newData.length, newData[0].length).setValues(newData);

  // アクセスカウンタ
  let oldCount = sheet.getRange("C2").getValues();  // 2次元配列で取得
  // Logger.log(oldCount);
  // Logger.log(typeof(oldCount[0][0]));
  newCount = [[oldCount[0][0] + 1]];  // プラス１
  // Logger.log(newCount);
  // Logger.log(typeof(newCount[0][0]));
  sheet.getRange("C2").setValues(newCount);
  template._count = newCount[0][0];  // htmlに渡すアクセスカウント変数


  // ------------------------------連続要素
  var day1to7 = [now_D];
  for(let i =1; i<7; i++){
    // dtが保持する日付を１日未来に加算する
    dt.setDate( dt.getDate()+1);

    // 加算された状態のインスタンスが持つ日付を取得する
    var tomorrowNum = dt.getDate();
    day1to7.push(tomorrowNum);
  }
  template.day1 = Number(day1to7[0]) + '<span style="font-size:60%;"> ' + youbi[now_w] + '</span>'; // now_Dだけは文字列型なので型変換してから使う
  template.day2 = day1to7[1] + '<span style="font-size:60%;"> ' + youbi[(Number(now_w) + 1) % 7] + '</span>';  // now_wも文字列型なので型変換して使う
  template.day3 = day1to7[2] + '<span style="font-size:60%;"> ' + youbi[(Number(now_w) + 2) % 7] + '</span>';
  template.day4 = day1to7[3] + '<span style="font-size:60%;"> ' + youbi[(Number(now_w) + 3) % 7] + '</span>';
  template.day5 = day1to7[4] + '<span style="font-size:60%;"> ' + youbi[(Number(now_w) + 4) % 7] + '</span>';
  template.day6 = day1to7[5] + '<span style="font-size:60%;"> ' + youbi[(Number(now_w) + 5) % 7] + '</span>';
  template.day7 = day1to7[6] + '<span style="font-size:60%;"> ' + youbi[(Number(now_w) + 6) % 7] + '</span>';


  // ------------------------------カレンダーの予定を取得する
  // 取得する期間を決める
  var startTime = new Date();
  startTime.setHours(0);
  startTime.setMinutes(0);
  startTime.setSeconds(0);
  var endTime = new Date();
  endTime.setDate(endTime.getDate()+6); // 6日後の日付つまり1週間分の予定を取得する
  endTime.setHours(23);
  endTime.setMinutes(59);
  endTime.setSeconds(59);

  // 各カレンダーオブジェクトをIDを指定して取得
  var calendar_my = CalendarApp.getCalendarById('anp7q1ccf1nh86hig6hjhci3ls@group.calendar.google.com');  // 「自分の予定」
  var calendar_un = CalendarApp.getCalendarById('7coi1b38ama53a4831e0up0khg@group.calendar.google.com');  // 「大学」
  var calendar_ba = CalendarApp.getCalendarById('tevkoseg5jsn5uqn5ojv76sm34@group.calendar.google.com');  // 「バイト」
  var calendar_of = CalendarApp.getCalendarById('0ae9757d72398ce704713b7d1a8dbd75bd07287fd82df0f387327386d078498e@group.calendar.google.com');  // 現「就活」　就職後「仕事」（officeのof）

  var weekEvents_my = calendar_my.getEvents(startTime, endTime);
  var weekEvents_un = calendar_un.getEvents(startTime, endTime);
  var weekEvents_ba = calendar_ba.getEvents(startTime, endTime);
  var weekEvents_of = calendar_of.getEvents(startTime, endTime);
  // ------------------------------ここまでで1週間分の全部の予定を取得し終わる

  // ------------------------------イベント情報を整理
  // 「自分の予定」
  var list_my = [];
  weekEvents_my.forEach(function(event)  {
    var start = event.getStartTime();
    var end = event.getEndTime();
    var isAllday = event.isAllDayEvent();

    // 開始時刻を分解
    let st_d = ('0' + start.getDate()).slice(-2);
    let st_h = ('0' + start.getHours()).slice(-2);
    let st_m = ('0' + start.getMinutes()).slice(-2);

    // 終了時刻を分解
    let en_d = ('0' + end.getDate()).slice(-2);
    let en_h = ('0' + end.getHours()).slice(-2);
    let en_m = ('0' + end.getMinutes()).slice(-2);

    list_my.push([st_d, st_h, st_m, en_d, en_h, en_m, isAllday, '0']);
  });
  
  // 「大学」
  var list_un = [];
  weekEvents_un.forEach(function(event)  {
    var start = event.getStartTime();
    var end = event.getEndTime();
    var isAllday = event.isAllDayEvent();

    // 開始時刻を分解
    let st_d = ('0' + start.getDate()).slice(-2);
    let st_h = ('0' + start.getHours()).slice(-2);
    let st_m = ('0' + start.getMinutes()).slice(-2);

    // 終了時刻を分解
    let en_d = ('0' + end.getDate()).slice(-2);
    let en_h = ('0' + end.getHours()).slice(-2);
    let en_m = ('0' + end.getMinutes()).slice(-2);

    list_un.push([st_d, st_h, st_m, en_d, en_h, en_m, isAllday, '1']);
  });
  
  // 「バイト」
  var list_ba = [];
  weekEvents_ba.forEach(function(event)  {
    var start = event.getStartTime();
    var end = event.getEndTime();
    var isAllday = event.isAllDayEvent();

    // 開始時刻を分解
    let st_d = ('0' + start.getDate()).slice(-2);
    let st_h = ('0' + start.getHours()).slice(-2);
    let st_m = ('0' + start.getMinutes()).slice(-2);

    // 終了時刻を分解
    let en_d = ('0' + end.getDate()).slice(-2);
    let en_h = ('0' + end.getHours()).slice(-2);
    let en_m = ('0' + end.getMinutes()).slice(-2);

    list_ba.push([st_d, st_h, st_m, en_d, en_h, en_m, isAllday, '2']);
  });

  // 「仕事」
  var list_of = [];
  weekEvents_of.forEach(function(event)  {
    var start = event.getStartTime();
    var end = event.getEndTime();
    var isAllday = event.isAllDayEvent();

    // 開始時刻を分解
    let st_d = ('0' + start.getDate()).slice(-2);
    let st_h = ('0' + start.getHours()).slice(-2);
    let st_m = ('0' + start.getMinutes()).slice(-2);

    // 終了時刻を分解
    let en_d = ('0' + end.getDate()).slice(-2);
    let en_h = ('0' + end.getHours()).slice(-2);
    let en_m = ('0' + end.getMinutes()).slice(-2);

    list_of.push([st_d, st_h, st_m, en_d, en_h, en_m, isAllday, '3']);
  });

  let lists = list_my.concat(list_un);
  lists = lists.concat(list_ba);
  lists = lists.concat(list_of);
  // Logger.log(lists);

  // 予定を分類
  let newLists = [];  // 日をまたぐ予定を分割し、もう一度2次元配列に入れる（日をまたぐ予定で要素が増えるから）
  let allDayEvent = []; // 終日予定がある日の　”日付”　を配列で格納？
  for(let youso of lists){
    let list = youso;
    if(list[6] == true) { // 終日イベントなら
      let element = list[0];
      if(!allDayEvent.includes(element)) {  // 　”日付”　を重複しないように格納
        allDayEvent.push(element);
      }
    }else if(list[3] != list[0]) { // 日をまたぐなら
      // 予定を分割する処理（さすがに3日間またぐことは起こりえないとする）
      newLists.push([list[0], list[1], list[2], list[0], '23', '59', false, list[7]]);
      newLists.push([list[3], '00', '00', list[3], list[4], list[5], false, list[7]]);
    }else { // 通常予定はそのまま
      newLists.push(list);
    }
  }

  // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■出力に必要な変数2つ
  // Logger.log(newLists);
  // Logger.log(newLists.length);  // 作るdiv要素の数に当たる
  for(let youso of allDayEvent){
    youso = Number(youso);
  }
  // ------------------------------

  // ------------------------------予定をdivタグにしてhtmlへ 予定1つに対してhtml要素と専用cssを一つずつ用意
  var _yoteiAll = '';
  var _yoteiStyle = '';
  for(let youso_list of newLists) {  // 予定１つに対し1回実行される部分↓
    let id = 'id' + youso_list[0] + youso_list[1] + youso_list[2] + youso_list[3] + youso_list[4] + youso_list[5];
    // html
    _yoteiAll += '<div id=' + id + '></div>';
    // css
    // 横にずらす
    // ------------------------------予定が何日後かを判別する部分
    let yoko = 0;
    day1to7.forEach((youso, index) => {
      if(youso == youso_list[0]) {
        yoko = index;
      }
    })

    // ------------------------------
    let start_posi = (Math.round((Number(youso_list[2]) / 60) * 10) / 10) + Number(youso_list[1]);     // ←*10 /10 で小数何桁まで丸めるか　10なら第2位を、100なら第2位を四捨五入
    let len_h = Number(youso_list[4]) - Number(youso_list[1]);
    let len_m = 60 - Number(youso_list[2]) + Number(youso_list[5]);
    // 繰り上げ
    if(len_m > 59) {
      len_h ++;
      len_m -= 60;
    }
    let end_posi = Math.floor((len_m/60) * 10) / 10 + len_h - 1;

    _yoteiStyle += '#' + id + '{';
    _yoteiStyle += 'width: 100%;';
    _yoteiStyle += 'position: absolute;';
    _yoteiStyle += 'left: calc((' + yoko + ' * 100%) + (' + yoko + ' * 1px));';   //  + (' + yoko + ' * 1px)の部分は、多分ボーダーの太さ分
    _yoteiStyle += 'top: calc(((100% / 24) - 0px) * ' + start_posi + ');';   // -1pxのせいでズレて他っぽい？
    _yoteiStyle += 'height: calc(((100% / 24) - 0px) * ' + end_posi + ' - 2px);';
    _yoteiStyle += '';
    _yoteiStyle += 'background-color: ';
    switch(youso_list[7]){
      case '0': _yoteiStyle += yotei_color[0]; break;
      case '1': _yoteiStyle += yotei_color[1]; break;
      case '2': _yoteiStyle += yotei_color[2]; break;
      case '3': _yoteiStyle += yotei_color[3]; break;
    }
    _yoteiStyle += ';';
    _yoteiStyle += 'border-top: 2px solid ';
    switch(youso_list[7]){
      case '0': _yoteiStyle += yotei_border_color[0]; break;
      case '1': _yoteiStyle += yotei_border_color[1]; break;
      case '2': _yoteiStyle += yotei_border_color[2]; break;
      case '3': _yoteiStyle += yotei_border_color[3]; break;
    }
    _yoteiStyle += ';';
    _yoteiStyle += 'border-bottom: 2px solid ';
    switch(youso_list[7]){
      case '0': _yoteiStyle += yotei_border_color[0]; break;
      case '1': _yoteiStyle += yotei_border_color[1]; break;
      case '2': _yoteiStyle += yotei_border_color[2]; break;
      case '3': _yoteiStyle += yotei_border_color[3]; break;
    }
    _yoteiStyle += ';';
    _yoteiStyle += 'z-index: 996;';
    _yoteiStyle += '}';

    // ------------------------------現在時刻と予定を基に、現在の状態を更新する部分↓
    // 現在時刻は　日時分　の6桁として扱う　例）25日2時38分　→　250238
    let now_shifen = now_D + now_h + now_m;
    let yotei_shifen_stt = youso_list[0] + youso_list[1] + youso_list[2];
    let yotei_shifen_end = youso_list[3] + youso_list[4] + youso_list[5];
    if(now_shifen > yotei_shifen_stt && now_shifen < yotei_shifen_end) {  // 文字列で大小比較できるのか？
      Logger.log('予定の中にいます！');
      Logger.log(`この予定の分類は、${youso_list[7]}`);
      switch(youso_list[7]) {
        case '0':
          template._message = message_list[2];
          break;
        case '1':
          template._message = message_list[3];
          break;
        case '2':
          template._message = message_list[4];
          break;
        case '3':
          template._message = message_list[5];
          break;
      }
    }


  }
  template._yoteiAll = _yoteiAll;
  template._yoteiStyle = _yoteiStyle;

  // ------------------------------↓終日イベント
  let _shujitsu_youbi = '';
  day1to7.forEach((youso, index) => {
    youso = ( '0' + youso).slice(-2);

    // 埋め込むhtmlを作成
  _shujitsu_youbi += '<div class="shujitsu_youbi">';
  if(allDayEvent.includes(youso)) {
    _shujitsu_youbi +=   '<div class="shujitsu_ari">';
    _shujitsu_youbi +=     '<p>' + shujitsu_str + '</p>';
    _shujitsu_youbi +=   '</div>';
  }else {
    _shujitsu_youbi +=   '<div class="shujitsu_nashi"></div>';
  }
    _shujitsu_youbi += '</div>';
  })
  template._shujitsu_youbi = _shujitsu_youbi;


  const htmlOutput = template.evaluate();
  // スマホ対応のための
  // https://uncle-gas.com/gas-html-mobile-friendly/#toc1
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1'); 

  // ------------------------------------------------------------↓スプレッドシートに予定を
  const sheet2 = ss.getSheetByName("取得予定リスト");
  var lastRow = sheet2.getLastRow()+1;  // ←最下の空白でないセルの行番号
  let newData2 = lists;  // 既に2次元配列
  // 既にある予定群を削除
  sheet2.getRange(2, 1, lastRow, newData2[0].length).clearContent(); // getRange(始点セル行, 始点セル列, 相対行, 相対列)
  // 取得した予定を書き込む
  sheet2.getRange(2, 1, newData2.length, newData2[0].length).setValues(newData2);    // ？？？？壊れたかも

  return htmlOutput;
}