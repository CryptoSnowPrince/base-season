"use client"
import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backgroundImage from '../assets/background.png'; // Import the background image
import { events } from '../wagmi';

const MAX_CHAR_COUNT = 30;
const TOTAL_NFTS = 100; // The total number of NFT slots
const TARGET_DATE = new Date(Date.UTC(2024, 9, 25, 18, 0, 0)); // October 25, 2024 18:00 UTC

// Modal Component for voting
const Modal = (props) => {
  const {
    show,
    onClose,
    onVote,
    projects,
    votes,
    selectedProject,
    setSelectedProject,
    voteCount,
    setVoteCount,
    isVotingLive,
    eventTitle,
    eventImage,
    winner,
    startTime,
    endTime,
  } = props;

  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 400);
    }
  }, [show]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!isVisible) return null;

  const totalVotes = votes.reduce((sum, voteCount) => sum + voteCount, 0);

  return (
    <div className={`modal-overlay ${!show ? 'fade-out' : ''}`} onClick={handleOverlayClick}>
      <div
        className={`modal-content ${!show ? 'fade-out' : ''}`}
        style={{
          backgroundImage: `url(${eventImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="modal-inner-content">
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <h2>{eventTitle}</h2>

          <p className={`voting-status ${isVotingLive ? 'live' : winner ? 'winner' : ''}`}>
            {isVotingLive ? (
              <span>
                Voting live... <span className="fading-dot">🔴</span>
              </span>
            ) : winner ? (
              `${winner} wins! 🏆`
            ) : (
              'Prepare to vote..'
            )}
          </p>

          <p className="voting-period">
            {`Voting Period: ${new Date(startTime).toUTCString()} - ${new Date(endTime).toUTCString()}`}
          </p>

          <div className="project-list">
            {projects.map((project, index) => (
              <div key={index} className="project-option">
                <button
                  className={`project-name-button ${selectedProject === project ? 'selected' : ''}`}
                  onClick={() => setSelectedProject(project)}
                  disabled={!isVotingLive}
                >
                  {project}
                </button>
                <div className="vote-bar">
                  <div
                    className="fill-bar"
                    style={{
                      width: `${totalVotes > 0 ? (votes[index] / totalVotes) * 100 : 0}%`,
                      transition: 'width 0.5s ease',
                    }}
                  ></div>
                  <span className="votes-inside-bar">{votes[index]} votes</span>
                </div>
              </div>
            ))}
          </div>

          <div className="vote-actions">
            <input
              type="number"
              value={voteCount}
              onChange={(e) => setVoteCount(Number(e.target.value))}
              min="1"
              placeholder="Votes"
              className="vote-count-input"
              disabled={!isVotingLive}
            />
            <button
              className="vote-button"
              onClick={onVote}
              disabled={!isVotingLive || !selectedProject || voteCount <= 0}
            >
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const canvasRef = useRef(null);
  const nftWallRef = useRef(null);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [mintedSlots, setMintedSlots] = useState(new Set());
  const [showMinting, setShowMinting] = useState(false);
  const [remainingTime, setRemainingTime] = useState(getRemainingTime());

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [voteCount, setVoteCount] = useState(1);
  const [projects, setProjects] = useState(['Project A', 'Project B']);
  const [votes, setVotes] = useState([0, 0]);
  const [isVotingLive, setIsVotingLive] = useState(false);
  const [winner, setWinner] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventStatus, setEventStatus] = useState('coming up');
  const [lastVotedProject, setLastVotedProject] = useState('');
  const [connectedWallet, setConnectedWallet] = useState('');

  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState('fade-in');
  const [statusAnimationDirection, setStatusAnimationDirection] = useState('fade-in');

  const handleNextEvent = () => {
    setAnimationDirection('fade-out');
    setStatusAnimationDirection('fade-out');

    setTimeout(() => {
      updateEventStatus();
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length);
      resetVotingState();
      checkVotingStatus();

      setAnimationDirection('fade-in');
      setTimeout(() => {
        setStatusAnimationDirection('fade-in');
      }, 2000);
    }, 500);
  };

  const handlePrevEvent = () => {
    setAnimationDirection('fade-out');
    setStatusAnimationDirection('fade-out');

    setTimeout(() => {
      updateEventStatus();
      setCurrentEventIndex((prevIndex) =>
        prevIndex === 0 ? events.length - 1 : prevIndex - 1
      );
      resetVotingState();
      checkVotingStatus();

      setAnimationDirection('fade-in');
      setTimeout(() => {
        setStatusAnimationDirection('fade-in');
      }, 2000);
    }, 500);
  };

  function getRemainingTime() {
    const currentTime = new Date();
    const timeDiff = TARGET_DATE - currentTime;
    if (timeDiff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((timeDiff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((timeDiff / (1000 * 60)) % 60),
      seconds: Math.floor((timeDiff / 1000) % 60),
    };
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeLeft = getRemainingTime();
      setRemainingTime(timeLeft);

      if (
        timeLeft.days === 0 &&
        timeLeft.hours === 0 &&
        timeLeft.minutes === 0 &&
        timeLeft.seconds === 0
      ) {
        setShowMinting(true);
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const resetVotingState = () => {
    setVotes([0, 0]); // Reset votes for the new event
    setWinner(null); // Clear the winner
  };

  const checkVotingStatus = () => {
    const currentTime = new Date();
    const currentEvent = events[currentEventIndex];
    if (currentTime >= currentEvent.startTime && currentTime <= currentEvent.endTime) {
      setIsVotingLive(true);
      setEventStatus('voting live.. 🔴');
    } else if (currentTime > currentEvent.endTime) {
      const maxVotes = Math.max(...votes);
      const winnerIndex = votes.indexOf(maxVotes);
      if (maxVotes > 0) {
        setWinner(projects[winnerIndex]);
        setEventStatus(`${projects[winnerIndex]} wins! 🏆`);
      } else {
        setWinner(projects[0]); // First project wins if no votes
        setEventStatus(`${projects[0]} wins! 🏆`);
      }
      setIsVotingLive(false);
    } else {
      setIsVotingLive(false);
      setEventStatus('coming up...');
    }
  };

  const updateEventStatus = () => {
    const currentEvent = events[currentEventIndex];
    const currentTime = new Date();
    if (currentTime < currentEvent.startTime) {
      setEventStatus('coming up...');
    } else if (currentTime >= currentEvent.startTime && currentTime <= currentEvent.endTime) {
      setEventStatus('voting live.. 🔴');
    } else if (currentTime > currentEvent.endTime) {
      const maxVotes = Math.max(...votes);
      const winnerIndex = votes.indexOf(maxVotes);
      if (maxVotes > 0) {
        setWinner(projects[winnerIndex]);
        setEventStatus(`${projects[winnerIndex]} wins! 🏆`);
      } else {
        setWinner(projects[0]); // First project wins if no votes
        setEventStatus(`${projects[0]} wins! 🏆`);
      }
    }
  };

  useEffect(() => {
    checkVotingStatus(); // Initial check on component mount
    const intervalId = setInterval(checkVotingStatus, 1000);
    return () => clearInterval(intervalId);
  }, [votes, projects, currentEventIndex]);

  const handleSlotClick = (index) => {
    if (mintedSlots.has(index)) {
      alert('This slot has already been minted.');
      return;
    }
    setSelectedSlot(index);
  };

  const handleMint = async () => {
    if (!selectedSlot && selectedSlot !== 0) {
      alert('Please select a slot to mint.');
      return;
    }
    if (line1.length + line2.length + line3.length > MAX_CHAR_COUNT) {
      alert(`Message exceeds the ${MAX_CHAR_COUNT}-character limit.`);
      return;
    }

    setIsMinting(true);
    try {
      const canvas = canvasRef.current;
      const imageDataUrl = canvas.toDataURL('image/png');
      const simulatedMetadataURI = imageDataUrl;

      setNfts((prevNfts) => {
        const updatedNfts = [...prevNfts];
        updatedNfts[selectedSlot] = {
          ...updatedNfts[selectedSlot],
          tokenURI: simulatedMetadataURI,
        };
        return updatedNfts;
      });

      setMintedSlots((prev) => new Set(prev).add(selectedSlot));
      setSelectedSlot(null);
      alert('NFT minted successfully! (Simulated)');
    } catch (error) {
      console.error(error);
      alert('Minting failed!');
    } finally {
      setIsMinting(false);
    }
  };

  const generateTestNFTs = () => {
    const testNFTs = [];
    for (let i = 1; i <= TOTAL_NFTS; i++) {
      testNFTs.push({
        tokenId: i,
        tokenURI: 'https://via.placeholder.com/100?text=NFT+' + i,
      });
    }
    setNfts(testNFTs);
  };

  useEffect(() => {
    generateTestNFTs();
  }, []);

  const openVoteModal = (title, imageUrl) => {
    const projectNames = title.split(' vs ').map((name) => name.trim());
    setProjects(projectNames);
    setEventTitle(title);
    setEventImage(imageUrl);
    setShowModal(true);
  };

  const handleVote = () => {
    const projectIndex = projects.indexOf(selectedProject);
    if (projectIndex !== -1) {
      setVotes((prevVotes) => {
        const updatedVotes = [...prevVotes];
        updatedVotes[projectIndex] += voteCount;
        return updatedVotes;
      });
      toast.success(`Vote for ${selectedProject} succeeded!`);
      setLastVotedProject(selectedProject);
    }
    setSelectedProject(null);
    setVoteCount(1);
  };

  // const connectWallet = async () => {
  //   const provider = window.ethereum; // For MetaMask and Coinbase Wallet

  //   if (provider) {
  //     try {
  //       const accounts = await provider.request({ method: 'eth_requestAccounts' });
  //       console.log('Connected account:', accounts[0]);
  //       setConnectedWallet(accounts[0]);
  //       toast.success('Wallet connected!');
  //     } catch (error) {
  //       console.error('Failed to connect wallet:', error);
  //       toast.error('Failed to connect wallet!');
  //     }
  //   } else {
  //     toast.error('Please install MetaMask or Coinbase Wallet!');
  //   }
  // };

  return (
    <div className="container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <Head>
        <title>Base Season</title>
        <meta name="description" content="Base Season" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      {/* <button className="connect-wallet-button" onClick={connectWallet}>
        {connectedWallet ? `Connected: ${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}` : 'Connect Wallet'}
        </button> */}

      <div className="center-box-wrapper">
        <div className="text-wrapper">
          <div className='header-wrapper'>
            <ConnectButton />
            <h1>Base Season.</h1>
          </div>

          {!showMinting && (
            <div className="timer">
              <div className="timer-boxes">
                <div className="timer-box">
                  <div className="time">{remainingTime.days}</div>
                  <div className="label">days</div>
                </div>
                <div className="timer-box">
                  <div className="time">{remainingTime.hours}</div>
                  <div className="label">hours</div>
                </div>
                <div className="timer-box">
                  <div className="time">{remainingTime.minutes}</div>
                  <div className="label">minutes</div>
                </div>
                {/* <div className="timer-box">
                  <div className="time">{remainingTime.seconds}</div>
                  <div className="label">seconds</div>
                </div> */}
              </div>
              <button className="greyed-out-button" disabled>
                Tournament underway...
              </button>
            </div>
          )}

          {/* Dynamic Event Title and Status */}
          <div className={`event-previews`}>
            <div className={`event-preview ${animationDirection}`}>
              <img
                className="event-image"
                src={events[currentEventIndex].image}
                alt="Event Now"
                onClick={() =>
                  openVoteModal(events[currentEventIndex].title, events[currentEventIndex].image)
                }
              />
              <h2 className="event-title">{events[currentEventIndex].title}</h2>
              <p className={`event-status ${isVotingLive ? 'live' : winner ? 'winner' : ''}`}>
                {isVotingLive ? (
                  <span>
                    Voting live... <span className="fading-dot">🔴</span>
                  </span>
                ) : (
                  eventStatus
                )}
              </p>
            </div>
          </div>

          {/* Carousel Navigation */}
          <div className="carousel-controls">
            <button onClick={handlePrevEvent}>⬅️ Previous</button>
            <button onClick={handleNextEvent}>Next ➡️</button>
          </div>

          {showMinting && (
            <div className="mint-section">
              <canvas ref={canvasRef} width={300} height={300} className="canvas-preview"></canvas>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="Enter first line"
                maxLength={10}
                className="text-input"
              />
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="Enter second line"
                maxLength={10}
                className="text-input"
              />
              <input
                type="text"
                value={line3}
                onChange={(e) => setLine3(e.target.value)}
                placeholder="Enter third line"
                maxLength={10}
                className="text-input"
              />
              <p>
                {line1.length + line2.length + line3.length}/{MAX_CHAR_COUNT}
              </p>
              <button onClick={handleMint} disabled={isMinting} className="mint-button">
                {isMinting ? 'Minting...' : 'Mint.'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="nft-wall-wrapper">
        <div className="nft-wall-container">
          <div ref={nftWallRef} className="nft-wall">
            {nfts.map((nft, index) => {
              const isMinted = mintedSlots.has(index);
              const isWhiteBackground =
                (Math.floor(index / 10) + (index % 10)) % 2 === 0; // Change to 10 for 10x10 grid

              return (
                <div
                  key={index}
                  className={`nft-item ${isMinted ? 'minted' : 'unfilled'} ${selectedSlot === index ? 'selected' : ''}`}
                  onClick={() => handleSlotClick(index)}
                  style={{ cursor: isMinted ? 'not-allowed' : 'pointer' }}
                >
                  {isMinted ? (
                    <img src={nft.tokenURI} alt={`NFT ${nft.tokenId}`} />
                  ) : (
                    <div
                      className={`placeholder-text ${isWhiteBackground ? 'white-background' : 'blue-background'}`}
                    >
                      bse.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onVote={handleVote}
        projects={projects}
        votes={votes}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        voteCount={voteCount}
        setVoteCount={setVoteCount}
        isVotingLive={isVotingLive}
        eventTitle={eventTitle}
        eventImage={eventImage}
        winner={winner}
        startTime={events[currentEventIndex].startTime}
        endTime={events[currentEventIndex].endTime}
      />
    </div>
  );
};

export default Home;
