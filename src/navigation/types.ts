import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";

export type RootTabParamList = {
  Start: undefined;
  Mapa: { spotId?: string } | undefined;
  Pogoda: undefined;
  Czat: undefined;
  Telemetria: undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

// W przyszłości, gdy dodamy Stack Navigatora (np. dla detali profilu),
// będziemy mogli tu zdefiniować CompositeScreenProps.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
