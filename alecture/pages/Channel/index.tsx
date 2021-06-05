import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Header } from './styles';
import useSWR, { useSWRInfinite } from 'swr';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { IChannel, IChat, IUser } from '@typings/db';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars-2';
import useSocket from '@hooks/userSocket';
import InviteChannelModal from '@components/InviteChannelModal';


const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: myData } = useSWR('/api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);
  const scrollbarRef = useRef<Scrollbars>(null);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const [socket] = useSocket(workspace);
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback((e)=> {
    e.preventDefault();
    if(chat?.trim() && chatData && channelData) {
      const savedChat = chat;
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift({
          id: (chatData[0][0]?.id || 0) + 1,
          content: savedChat,
          UserId: myData.id,
          User: myData,
          ChannelId: channelData?.id,
          Channel: channelData,
          createdAt: new Date()
        });
        return prevChatData
      }, false)
      .then(()=> {
        setChat('');
        scrollbarRef.current?.scrollToBottom();
      })

      axios.post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
        content: chat,
      }).then(()=> {
        revalidate(); 
      }).catch((err)=> {
        console.log(err);
      })
    }
  }, [chat, chatData, myData, channelData, workspace, channel])

  const onMessage = useCallback((data: IChat)=> {
    console.log("sdfsdf");
    if (data.Channel.name === channel && data.UserId !== myData?.id) {
      console.log("1");
      mutateChat((chatData) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollbarRef.current) {
          console.log("2");
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
          ) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 10);
          }
        }
      });
    }
  }, [channel])

  useEffect(()=> {
    socket?.on('dm', onMessage);

    return () => {
      socket?.off('dm', onMessage)
    }
  }, [socket, onMessage])



  //로딩시 스크롤바 제일 아래로
  useEffect(()=> {
    console.log(chatData);
    if(chatData?.length === 1) {
      console.log("슼크롤바아래로");
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData, myData]) 

  const onClickInviteChannel = useCallback(()=> {
    setShowInviteChannelModal(true);
  }, [])

  const onCloseModal = useCallback(()=> {
    setShowInviteChannelModal(false);
  }, [])


  if(!myData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd}/>
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} placeholder={"dm으로 말할곳"}/>
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </Container>
  )
}

export default Channel