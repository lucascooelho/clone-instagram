import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";

import LazyImage from '../../components/LazyImage';

import { Post, Header, Avatar, Name, Description, Loading } from "./styles";

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewable, setViewable] = useState([]);

  async function loadPage(pageNumber = page, shouldRefresh = false) {
    if (total && pageNumber > total) return;

    setLoading(true);

    const response = await fetch(
        `http://192.168.1.23:3000/feed?_expand=author&_limit=5&_page=${pageNumber}`
    );
    //yarn json-server --host 192.168.1.23 server.json -d 1000 -w

    const data = await response.json();
    const totalItems = response.headers.get('X-Total-Count');
    
    setTotal(Math.floor(totalItems / 5));
    setFeed(shouldRefresh ? data : [...feed, ...data]);
    setPage(pageNumber + 1);
    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, []);


  // VIDEO AT 37:50

  async function refreshList() {
    setRefreshing(true);

    await loadPage(1, true);

    setRefreshing(false);
  }

  const viewableChangedHandler = useCallback(({ changed }) => {
    setViewable(changed.map(({ item }) => item.id));
  }, []);

  return (
    <View>
      <FlatList
        data={feed}
        keyExtractor={(post, index) => String(index)}
        onEndReached={() => loadPage()}
        onEndReachedThreshold={0.1}
        onRefresh={refreshList}
        refreshing={refreshing}
        onViewableItemsChanged={viewableChangedHandler}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 20 }}
        ListFooterComponent={loading && <Loading />}
        renderItem={({ item }) => (
          <Post>
            <Header>
              <Avatar source={{ uri: item.author.avatar }} />
              <Name>{item.author.name}</Name>
            </Header>

            <LazyImage
              shouldLoad={viewable.includes(item.id)}
              aspectRatio={item.aspectRatio}
              smallSource={{ uri: item.small }}
              source={{ uri: item.image }}
            />

            <Description>
              <Name>{item.author.name}</Name> {item.description}
            </Description>
          </Post>
        )}
      />
    </View>
  );
}
