import MovieDisplayCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies, fetchTVShows, getTrendingMovies, getTrendingTVShows } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";


const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  const {
    data: tvShows,
    loading: tvLoading,
    error: tvError,
    refetch: loadTVShows,
    reset: resetTVShows,
  } = useFetch(() => fetchTVShows({ query: searchQuery }), false);

  // Fetch latest movies and TV shows when no search query
  const {
    data: latestMovies,
    loading: latestMoviesLoading,
    error: latestMoviesError,
  } = useFetch(() => fetchMovies({ query: "" }), !searchQuery.trim());

  const {
    data: latestTVShows,
    loading: latestTVShowsLoading,
    error: latestTVShowsError,
  } = useFetch(() => fetchTVShows({ query: "" }), !searchQuery.trim());

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies, !searchQuery.trim());

  const {
    data: trendingTVShows,
    loading: trendingTVLoading,
    error: trendingTVError,
  } = useFetch(getTrendingTVShows, !searchQuery.trim());

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
        await loadTVShows();

        // Call updateSearchCount only if there are results
        if (movies?.length! > 0 && movies?.[0]) {
          await updateSearchCount(searchQuery, movies[0]);
        }
      } else {
        reset();
        resetTVShows();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Combine search results for movies and TV shows
  const searchResults = searchQuery.trim() 
    ? [...(movies || []), ...(tvShows || [])]
    : [];

  // Combine latest content for display when no search
  const latestContent = !searchQuery.trim() 
    ? [...(latestMovies || []).slice(0, 6), ...(latestTVShows || []).slice(0, 6)]
    : [];

  const isSearching = searchQuery.trim() !== "";
  const isLoadingSearch = loading || tvLoading;
  const hasSearchError = error || tvError;
  const isLoadingLatest = latestMoviesLoading || latestTVShowsLoading || trendingLoading || trendingTVLoading;
  const hasLatestError = latestMoviesError || latestTVShowsError || trendingError || trendingTVError;

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={isSearching ? searchResults : latestContent}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                placeholder="Search for a movie & TV show"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {(isSearching ? isLoadingSearch : isLoadingLatest) && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {(isSearching ? hasSearchError : hasLatestError) && (
              <Text className="text-red-500 px-5 my-3">
                Error: {(error || tvError || latestMoviesError || latestTVShowsError || trendingError || trendingTVError)?.message}
              </Text>
            )}

            {isSearching && !isLoadingSearch && !hasSearchError && searchResults.length > 0 && (
              <Text className="text-xl text-white font-bold">
                Search Results for{" "}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}

            {!isSearching && !isLoadingLatest && !hasLatestError && (
              <>


                {latestContent.length > 0 && (
                  <Text className="text-lg text-white font-bold mb-3">
                    Latest Movies & TV Shows
                  </Text>
                )}
              </>
            )}
          </>
        }
        ListEmptyComponent={
          !(isSearching ? isLoadingSearch : isLoadingLatest) && !(isSearching ? hasSearchError : hasLatestError) ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? "No content found"
                  : "Start typing to search for movies & TV shows"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
