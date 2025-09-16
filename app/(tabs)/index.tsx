import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies, fetchTVShows, getTrendingMovies, getTrendingTVShows } from "@/services/api";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View, } from "react-native";
import MovieCard from "../../components/MovieCard";
import SearchBar from "../../components/SearchBar";
import TrendingCard from "../../components/TrendingCard";


const Index = () => {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  const {
    data: tvShows,
    loading: tvShowsLoading,
    error: tvShowsError,
  } = useFetch(() => fetchTVShows({ query: "" }));

  const {
    data: trendingTVShows,
    loading: trendingTVLoading,
    error: trendingTVError,
  } = useFetch(getTrendingTVShows);

  // Combine latest content for display
  const latestMovies = (movies || []).slice(0, 6);
  const latestTVShows = (tvShows || []).slice(0, 6).map((tvShow: any) => ({
    ...tvShow,
    title: tvShow.name, // Map name to title for consistency
    release_date: tvShow.first_air_date, // Map first_air_date to release_date for consistency
  }));
  const latestContent = [...latestMovies, ...latestTVShows];

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {moviesLoading || tvShowsLoading || trendingLoading || trendingTVLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : moviesError || tvShowsError || trendingError || trendingTVError ? (
          <Text>Error: {moviesError?.message || tvShowsError?.message || trendingError?.message || trendingTVError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => {
                router.push("/search");
              }}
              placeholder="Search for a movie & TV show"
            />

              {/* Trending Movies Section */}
                {trendingMovies && trendingMovies.length > 0 && (
                  <View className="mt-5">
                    <Text className="text-lg text-white font-bold mb-3">
                      Trending Movies
                    </Text>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={trendingMovies}
                      contentContainerStyle={{ gap: 26 }}
                      renderItem={({ item, index }) => (
                        <TrendingCard movie={item} index={index} />
                      )}
                      keyExtractor={(item) => item.movie_id.toString()}
                    />
                  </View>
                )}

                

                {/* Trending TV Shows Section */}
                {trendingTVShows && trendingTVShows.length > 0 && (
                  <View className="mt-5">
                    <Text className="text-lg text-white font-bold mb-3">
                      Trending TV Shows
                    </Text>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={trendingTVShows}
                      contentContainerStyle={{ gap: 26 }}
                      renderItem={({ item, index }) => (
                        <TrendingCard 
                          movie={{
                            searchTerm: item.searchTerm,
                            movie_id: item.tv_id,
                            title: item.name,
                            count: item.count,
                            poster_url: item.poster_url
                          }} 
                          index={index}
                          type="tv"
                        />
                      )}
                      keyExtractor={(item) => item.tv_id.toString()}
                    />
                  </View>
                )}

            {/* Latest Content Section */}
            {latestContent && latestContent.length > 0 && (
              <>
                <Text className="text-lg text-white font-bold mt-5 mb-3">
                  Latest Movies & TV Shows
                </Text>

                <FlatList
                  data={latestContent}
                  renderItem={({ item }) => <MovieCard {...item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                  columnWrapperStyle={{
                    justifyContent: "flex-start",
                    gap: 20,
                    paddingRight: 5,
                    marginBottom: 10,
                  }}
                  className="mt-2 pb-32"
                  scrollEnabled={false}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
