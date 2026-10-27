import React from 'react';
import SynchronizedVideoStage from './SynchronizedVideoStage';
import InteractiveSidebar from './InteractiveSidebar';
import { useWatchParty } from '../context/WatchPartyContext';

export default function TheaterView() {
  const { currentRoom } = useWatchParty();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Main Cinema Grid: 8 Cols Video + 4 Cols Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <SynchronizedVideoStage />
        </div>

        <div className="lg:col-span-4">
          <InteractiveSidebar />
        </div>
      </div>
    </div>
  );
}
