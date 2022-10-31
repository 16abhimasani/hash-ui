import { NULL_ADDRESS } from '../constants';

export const getAddressFromTopicSafely = (topic?: string) => {
  if (!topic) return NULL_ADDRESS;
  return '0x' + topic.slice(26);
};

export const getAddressFromTopic = (topic?: string) => {
  if (!topic) return undefined;
  return '0x' + topic.slice(26);
};
