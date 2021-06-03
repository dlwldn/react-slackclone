import Chat from '@components/Chat';
import { IDM } from '@typings/db';
import React, { VFC } from 'react';
import { ChatZone } from './styles';

interface Props {
  chatData?: IDM[];
}

const ChatList: VFC<Props> = ({ chatData }) => {
  return (
    <ChatZone>
      {chatData?.map((chat)=> {
        return (
          <Chat key={chat.id} data={chat} />
        )
      })}
    </ChatZone>
  )
}

export default ChatList;