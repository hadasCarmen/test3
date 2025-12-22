
import fs from "fs";
import readline from "readline-sync";
const generalUrl = "https://spies-test-server.vercel.app/";

async function fetchUsers() {
  try {
    const users = await fetch(generalUrl + "people");
    const usersList = await users.text();
    const usersArray = JSON.parse(usersList);
    await fs.promises.writeFile(
      "data/people.json",
      JSON.stringify(usersArray, null, 2),
      "utf8"
    );
    console.log("sucsses");
    return usersArray;
  } catch (error) {
    console.log(error);
  }
}


async function fetchRecords() {
  try {
    const records = await fetch(generalUrl + "transcriptions");
    const recordsList = await records.text();
    const recordsArray = JSON.parse(recordsList);
    await fs.promises.writeFile(
      "data/transcriptions.json",
      JSON.stringify(recordsArray, null, 2),
      "utf8"
    );
    console.log("sucsses");
  } catch (error) {
    console.log(error);
  }
}

async function findUserByName() {
  const name = readline.question("write the name");
  const data = await fs.promises.readFile("data/people.json", "utf8");
  const goodData = JSON.parse(data);
  for (const people of goodData) {
    if (people.name === name) {
      return people;
    }
  }
  console.log("people not found");
}

async function findUserByAge(params) {
  const age = readline.question("write the age");
  const data = await fs.promises.readFile("data/people.json", "utf8");
  const goodData = JSON.parse(data);

  for (const people of goodData) {
    console.log(people);
    if (people.age === age) {
      return people;
    }
  }
  console.log("the person was not found.");
}

async function levelDanger() {
  const data = await fs.promises.readFile("data/transcriptions.json", "utf8");
  const goodData = JSON.parse(data);
  const listAgeDanger = {};
  for (const transcriptions of goodData) {
    if (listAgeDanger[transcriptions.age]) {
      listAgeDanger[transcriptions.age].push(
        wordInContent(transcriptions.content)
      );
    } else {
      listAgeDanger[transcriptions.age] = [
        wordInContent(transcriptions.content),
      ];
    }
  }
  const avgList = topDangerListToAvarge(listAgeDanger);
  const sotrList = Object.entries(avgList);
  sotrList.sort((a, b) => a[1] - b[1]);
  const topDangerAGE = [
    sotrList[sotrList.length - 1][0],
    sotrList[sotrList.length - 2][0],
    sotrList[sotrList.length - 3][0],
  ];
  const data1 = await fs.promises.readFile("data/people.json", "utf8");
  const goodData1 = JSON.parse(data1);
    const allPeopleDangerList=[]
  topDangerAGE.map((age)=>{
    goodData1.map((people)=>{if(people.age==age){
        allPeopleDangerList.push(people)
    }
})
    
  })
  sendListAsUrlParam(generalUrl, allPeopleDangerList);
  const goodSortList = Object.fromEntries(sotrList);
}

function wordInContent(content) {
  let sumDangerWords = 0;
  const arrayContent = content
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, "")
    .split(" ");
  for (const word of arrayContent) {
    if (
      word === "attack" ||
      word === "death" ||
      word === "knife" ||
      word === "bomb"
    ) {
      sumDangerWords += 1;
    }
  }
  return sumDangerWords;
}

function topDangerListToAvarge(listAgeDanger) {
  const keysList = Object.keys(listAgeDanger);
  for (let i = 0; i < keysList.length; i++) {
    const sum = listAgeDanger[keysList[i]].reduce(
      (sumi, currentNumOfDanger) => sumi + currentNumOfDanger,
      0
    );
    const average = sum / listAgeDanger[keysList[i]].length;
    listAgeDanger[keysList[i]] = average;
  }
  return listAgeDanger;
}
levelDanger();

async function sendListAsUrlParam(generalUrl, list) {
  const endpoint = "report";
  const fullUrl = generalUrl + endpoint;
  const params = new URLSearchParams();
  const listAsString = list.map(encodeURIComponent).join(",");
  params.append("listParam", listAsString);
  const urlWithParams = fullUrl + "?" + params.toString();

  console.log("Sending request to URL:", urlWithParams);

  try {
    const response = await fetch(urlWithParams);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseText = await response.text();
    console.log("Response from server:");
    console.log(responseText);
  } catch (error) {
    console.error("Error during fetch operation:", error);
  }
}

