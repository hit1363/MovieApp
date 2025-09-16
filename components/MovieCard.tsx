import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";

type MovieCardProps = Movie | TVShow;

const MovieCard = (item: MovieCardProps) => {
  // Use more reliable detection - TV shows have first_air_date, movies have release_date
  const isMovie = 'release_date' in item && !('first_air_date' in item);
  
  const id = item.id;
  const poster_path = item.poster_path;
  const title = isMovie ? (item as Movie).title : (item as TVShow).name;
  const vote_average = item.vote_average;
  const release_date = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const type = isMovie ? 'Movie' : 'TV Show';

  const linkProps = isMovie 
    ? { pathname: "/movie/[id]" as const, params: { id: id.toString() } }
    : { pathname: "/movie/[id]" as const, params: { id: id.toString(), type: 'tv' } };

  return (
    <Link href={linkProps} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {title}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-white font-bold uppercase">
            {Math.round(vote_average / 2)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {release_date?.split("-")[0] || "N/A"}
          </Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            {type}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;
