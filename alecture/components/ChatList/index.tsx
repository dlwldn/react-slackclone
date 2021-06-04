import Chat from '@components/Chat';
import { IDM, IChat } from '@typings/db';
import React, { useCallback, forwardRef } from 'react';
import { ChatZone, Section, StickyHeader } from './styles';
import { Scrollbars } from 'react-custom-scrollbars-2';

interface Props {
  chatSections: {[key: string]: IDM[] };
  setSize: (f: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

const ChatList = forwardRef<Scrollbars, Props>(({ chatSections, setSize, isEmpty, isReachingEnd }, ref) => {
 
  const onScroll = useCallback((values)=> {
    if(values.scrollTop === 0 && !isReachingEnd) {
      console.log("가장 위");
      // 데이터 추가 로딩
      setSize((prevSize)=> prevSize + 1)
      .then(()=> {
        //스크롤 위치 유지
      })
    }
  }, [])


  return (
    <ChatZone>
      <Scrollbars autoHide ref={ref} onScrollFrame={onScroll}>
      {Object.entries(chatSections).map(([date, chats]) => {
        return (
          <Section className={`section-${date}`} key={date}>
            <StickyHeader>
              <button>{date}</button>
            </StickyHeader>
            {chats.map((chat) => {
              return(
                <Chat key={chat.id} data={chat} />
              )
            })}
          </Section>
        )
      })}
      </Scrollbars>
    </ChatZone>
  )
});

export default ChatList;