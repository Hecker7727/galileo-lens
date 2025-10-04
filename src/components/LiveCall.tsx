import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Users,
  Share,
  MessageSquare,
  Settings
} from 'lucide-react';

interface LiveCallProps {
  roomId?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  hasVideo: boolean;
  isHost: boolean;
}

export default function LiveCall({ roomId = 'demo-room' }: LiveCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Mock participants data
  const [participants] = useState<Participant[]>([
    {
      id: 'user1',
      name: 'Dr. Sarah Chen',
      avatar: undefined,
      isMuted: false,
      hasVideo: true,
      isHost: true
    },
    {
      id: 'user2',
      name: 'Dr. Mark Thompson',
      avatar: undefined,
      isMuted: true,
      hasVideo: false,
      isHost: false
    },
    {
      id: 'user3',
      name: 'Dr. Lisa Rodriguez',
      avatar: undefined,
      isMuted: false,
      hasVideo: true,
      isHost: false
    }
  ]);

  const handleJoinCall = () => {
    setIsConnected(true);
  };

  const handleLeaveCall = () => {
    setIsConnected(false);
    setIsMuted(false);
    setHasVideo(false);
    setIsSharing(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setHasVideo(!hasVideo);
  };

  const toggleScreenShare = () => {
    setIsSharing(!isSharing);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Research Collaboration Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="font-semibold">Join Research Discussion</h3>
              <p className="text-sm text-muted-foreground">
                Room ID: {roomId}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">
                {participants.length} participant{participants.length !== 1 ? 's' : ''} waiting
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Participants:</h4>
              <div className="space-y-2">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{participant.name}</span>
                    {participant.isHost && (
                      <Badge variant="outline" className="text-xs">Host</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleJoinCall}
              className="w-full max-w-xs"
            >
              <Phone className="mr-2 h-4 w-4" />
              Join Call
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map(participant => (
              <div key={participant.id} className="relative">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  {participant.hasVideo ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📹</span>
                    </div>
                  ) : (
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-lg">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {participant.name}
                  </Badge>
                  {participant.isHost && (
                    <Badge variant="outline" className="text-xs">Host</Badge>
                  )}
                </div>

                <div className="absolute bottom-2 right-2 flex gap-1">
                  {participant.isMuted && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {!participant.hasVideo && (
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <VideoOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isSharing && (
            <div className="mt-4 p-4 border-2 border-dashed border-blue-500 rounded-lg">
              <div className="text-center space-y-2">
                <Share className="h-8 w-8 mx-auto text-blue-500" />
                <p className="text-sm font-medium">Screen Sharing Active</p>
                <p className="text-xs text-muted-foreground">
                  You are sharing your screen with all participants
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant={hasVideo ? "secondary" : "outline"}
              size="sm"
              onClick={toggleVideo}
            >
              {hasVideo ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isSharing ? "default" : "outline"}
              size="sm"
              onClick={toggleScreenShare}
            >
              <Share className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleLeaveCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center mt-3">
            <Badge variant="secondary" className="text-xs">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} • Room: {roomId}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Call Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h4 className="font-medium">Research Collaboration Session</h4>
            <p className="text-sm text-muted-foreground">
              Discussing Mars mission health protocols and countermeasures
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Started: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span>Duration: {Math.floor(Math.random() * 30) + 5}min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}