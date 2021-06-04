import { IDM } from '@typings/db';
import dayjs from 'dayjs';


export default function makeSection(chatList: IDM[]) {
  const sections: {[key: string]: IDM[]} = {};
  chatList.forEach((chat)=> {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if(Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
 
  })

  return sections;
}

// [{id: 1, d: '2021-02-25'}, {id: 2, d: '2021-03-25'}, {id: 3, d: '2021-04-25'} ]