export interface ServiceFeature {
  id: string;
  text: string;
}

export interface Service {
  id: string;
  title: string;
  tag: string;
  iconName: string;
  path: string; // NEW: Route path for the detail page
}
