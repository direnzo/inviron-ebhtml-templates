var minutos = [];
minutos[0]= "video_1.mp4";
minutos[1]= "video_1.mp4";
minutos[2]= "video_1.mp4";
minutos[3]= "video_1.mp4";
minutos[4]= "video_1.mp4";
minutos[5]= "video_2.mp4";
minutos[6]= "video_2.mp4";
minutos[7]= "video_2.mp4";
minutos[8]= "video_2.mp4";
minutos[9]= "video_2.mp4";
minutos[10]= "video_1.mp4";
minutos[11]= "video_1.mp4";
minutos[12]= "video_1.mp4";
minutos[13]= "video_1.mp4";
minutos[14]= "video_1.mp4";
minutos[15]= "video_2.mp4";
minutos[16]= "video_2.mp4";
minutos[17]= "video_2.mp4";
minutos[18]= "video_2.mp4";
minutos[19]= "video_2.mp4";
minutos[20]= "video_1.mp4";
minutos[21]= "video_1.mp4";
minutos[22]= "video_1.mp4";
minutos[23]= "video_1.mp4";
minutos[24]= "video_1.mp4";
minutos[25]= "video_2.mp4";
minutos[26]= "video_2.mp4";
minutos[27]= "video_2.mp4";
minutos[28]= "video_2.mp4";
minutos[29]= "video_2.mp4";
minutos[30]= "video_1.mp4";
minutos[31]= "video_1.mp4";
minutos[32]= "video_1.mp4";
minutos[33]= "video_1.mp4";
minutos[34]= "video_1.mp4";
minutos[35]= "video_2.mp4";
minutos[36]= "video_2.mp4";
minutos[37]= "video_2.mp4";
minutos[38]= "video_2.mp4";
minutos[39]= "video_2.mp4";
minutos[40]= "video_1.mp4";
minutos[41]= "video_1.mp4";
minutos[42]= "video_1.mp4";
minutos[43]= "video_1.mp4";
minutos[44]= "video_1.mp4";
minutos[45]= "video_2.mp4";
minutos[46]= "video_2.mp4";
minutos[47]= "video_2.mp4";
minutos[48]= "video_2.mp4";
minutos[49]= "video_2.mp4";
minutos[50]= "video_1.mp4";
minutos[51]= "video_1.mp4";
minutos[52]= "video_1.mp4";
minutos[53]= "video_1.mp4";
minutos[54]= "video_1.mp4";
minutos[55]= "video_2.mp4";
minutos[56]= "video_2.mp4";
minutos[57]= "video_2.mp4";
minutos[58]= "video_2.mp4";
minutos[59]= "video_2.mp4";

function mudaCor() {	
	var minutes = new Date().getMinutes();
	
	document.getElementById("container-esquerdo").innerHTML = '<video id="the-video"  width="2368" height="912" autoplay muted loop><source src="'+ minutos[minutes] +'" type="video/mp4">Your browser does not support the video tag.</video>';
	
	lastHour = minutes;
}

geraIntervalo();

var lastHour = -1;

function geraIntervalo() {
	var a = new Date();
	var b = a.getHours();
	var c = a.getMinutes();
	if (b < 10) {
		b = "0" + b;
	}
	if (c < 10) {
		c = "0" + c;
	}
	document.getElementById("relogio-digital").innerHTML =
	"<p>" + b + ":" + c + "</p>";
	
	if(b != lastHour)
		mudaCor();
}

//setInterval(geraIntervalo, 1000);