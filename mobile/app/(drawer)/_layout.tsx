import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../../components/CustomDrawerContent";

export default function DrawerLayout() {
  return (
    <Drawer drawerContent={(props: any) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="home"
        options={{
          headerTitle: "Home",
          title: "Home",
        }}
      />
    </Drawer>
  );
}
