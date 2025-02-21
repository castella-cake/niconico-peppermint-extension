export interface DAnimeLinksDataRootObject {
  meta: Meta;
  data: Data;
}

interface Data {
  items: Item[];
}

interface Item {
  channel: Channel;
  isChannelMember: boolean;
  linkedVideoId: string;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  isFree: boolean;
  screenName: string;
  ownerName: string;
  isAdult: boolean;
  price: number;
  bodyPrice: number;
  url: string;
  thumbnailUrl: string;
  thumbnailSmallUrl: string;
  canAdmit: boolean;
}

interface Meta {
  status: number;
}