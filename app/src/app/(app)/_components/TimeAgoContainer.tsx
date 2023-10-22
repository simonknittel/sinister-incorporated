"use client";

import TimeAgo from "react-timeago";

interface Props {
  date: Date | string;
}

const TimeAgoContainer = ({ date }: Readonly<Props>) => {
  return <TimeAgo date={date} />;
};

export default TimeAgoContainer;
