import { icons } from "@/constants/icons";
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/auth";

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // Sync selected image with authUser.profilePic updates
  useEffect(() => {
    if (authUser?.profilePic) {
      setSelectedImg(authUser.profilePic);
    }
  }, [authUser?.profilePic]);

  const handleImageUpload = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your photos!");
        return;
      }

      // Pick an image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        // Set local preview instantly
        setSelectedImg(imageUri);

        try {
          // Update in backend + authUser state
          const updatedUser = await updateProfile({ profilePic: imageUri });

          // Replace preview with backend URL if available
          if (updatedUser?.profilePic) {
            setSelectedImg(updatedUser.profilePic);
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  return (
    <SafeAreaView className="bg-primary flex-1 px-10">
      <ScrollView className="flex-1 pt-20">
        <View className="max-w-2xl mx-auto p-4 py-8">
          <View className="bg-base-300 rounded-xl p-6 space-y-8">
            <View className="text-center">
              <Text className="text-2xl font-semibold text-white">Profile</Text>
              <Text className="mt-2 text-gray-400">Your profile information</Text>
            </View>

            <View className="flex flex-col items-center gap-4">
              <View className="relative">
                <Image
                  source={{ uri: selectedImg || authUser?.profilePic || 'https://via.placeholder.com/150' }}
                  className="w-32 h-32 rounded-full border-4 border-gray-300"
                  style={{ width: 128, height: 128, borderRadius: 64 }}
                />
                <TouchableOpacity
                  onPress={handleImageUpload}
                  className={`absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full ${
                    isUpdatingProfile ? "opacity-50" : ""
                  }`}
                  disabled={isUpdatingProfile}
                >
                  <Image 
                    source={icons.person} 
                    className="w-5 h-5" 
                    style={{ width: 20, height: 20, tintColor: 'white' }}
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-gray-400">
                {isUpdatingProfile ? "Uploading..." : "Tap the camera icon to update your photo"}
              </Text>
            </View>

            <View className="space-y-6">
              <View className="space-y-1.5">
                <View className="text-sm text-gray-400 flex flex-row items-center gap-2">
                  <Image 
                    source={icons.person} 
                    className="w-4 h-4" 
                    style={{ width: 16, height: 16, tintColor: '#9ca3af' }}
                  />
                  <Text className="text-gray-400">Full Name</Text>
                </View>
                <View className="px-4 py-2.5 bg-gray-700 rounded-lg border border-gray-600">
                  <Text className="text-white">{authUser?.fullName}</Text>
                </View>
              </View>

              <View className="space-y-1.5">
                <View className="text-sm text-gray-400 flex flex-row items-center gap-2">
                  <Image 
                    source={icons.person} 
                    className="w-4 h-4" 
                    style={{ width: 16, height: 16, tintColor: '#9ca3af' }}
                  />
                  <Text className="text-gray-400">Email Address</Text>
                </View>
                <View className="px-4 py-2.5 bg-gray-700 rounded-lg border border-gray-600">
                  <Text className="text-white">{authUser?.email}</Text>
                </View>
              </View>
            </View>

            <View className="mt-6 bg-gray-800 rounded-xl p-6">
              <Text className="text-lg font-medium text-white mb-4">Account Information</Text>
              <View className="space-y-3 text-sm">
                <View className="flex flex-row items-center justify-between py-2 border-b border-gray-700">
                  <Text className="text-gray-400">Member Since</Text>
                  <Text className="text-white">{authUser?.createdAt?.split("T")[0]}</Text>
                </View>
                <View className="flex flex-row items-center justify-between py-2">
                  <Text className="text-gray-400">Account Status</Text>
                  <Text className="text-green-500">Active</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
