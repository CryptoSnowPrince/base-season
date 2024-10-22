"use client"
import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backgroundImage from '../assets/background.png'; // Import the background image
import { chain, events, MAX_UINT256, MIN_ETH, TOKEN_DECIMALS, tokenCA, voteCA } from '../wagmi';
import { useContractStatus } from '../hook/useContractStatus';
import { useAccount, useConfig } from 'wagmi';
import { encodeFunctionData, parseUnits } from 'viem';
import {
  estimateGas,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import voteABI from "../assets/abi/vote.json";
import erc20ABI from "../assets/abi/erc20.json";
import ConnectWallet from '../components/ConnectWallet';

const TOTAL_NFTS = 100; // The total number of NFT slots

// Modal Component for voting
const Modal = (props) => {
  const {
    show,
    onClose,
    onVote,
    voteId,
    projects,
    votes,
    pending,
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
              disabled={pending || !isVotingLive || !selectedProject || voteCount <= 0}
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
  const account = useAccount();
  const config = useConfig();

  const [refresh, setRefresh] = useState(false);
  const [voteId, setVoteId] = useState(0);

  const onchainData = useContractStatus(refresh, voteId)

  const [pending, setPending] = useState(false);

  const nftWallRef = useRef(null);
  const [nfts, setNfts] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [mintedSlots, setMintedSlots] = useState(new Set());
  const [remainingTime, setRemainingTime] = useState(getRemainingTime(voteId));

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [voteCount, setVoteCount] = useState(1);

  const [isVotingLive, setIsVotingLive] = useState(false);
  const [winner, setWinner] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventStatus, setEventStatus] = useState('coming up');
  const [lastVotedProject, setLastVotedProject] = useState('');

  const [animationDirection, setAnimationDirection] = useState('fade-in');
  // const [statusAnimationDirection, setStatusAnimationDirection] = useState('fade-in');

  const checkVotingStatus = () => {
    const currentTime = new Date();
    const currentEvent = events[voteId];
    if (currentTime >= currentEvent.startTime && currentTime <= currentEvent.endTime) {
      setIsVotingLive(true);
      setEventStatus('voting live.. 🔴');
    } else if (currentTime > currentEvent.endTime) {
      const maxVotes = Math.max(...onchainData?.votes);
      const winnerIndex = onchainData?.votes.indexOf(maxVotes);
      if (maxVotes > 0) {
        setWinner(onchainData?.projects[winnerIndex]);
        setEventStatus(`${onchainData?.projects[winnerIndex]} wins! 🏆`);
      } else {
        setWinner(onchainData?.projects[0]); // First project wins if no votes
        setEventStatus(`${onchainData?.projects[0]} wins! 🏆`);
      }
      setIsVotingLive(false);
    } else {
      setIsVotingLive(false);
      setEventStatus('coming up...');
    }
  };

  const handleNextEvent = () => {
    setAnimationDirection('fade-out');
    // setStatusAnimationDirection('fade-out');

    setTimeout(() => {
      setVoteId((prevIndex) => (prevIndex + 1) % events.length);

      setAnimationDirection('fade-in');
      // setTimeout(() => {
      //   setStatusAnimationDirection('fade-in');
      // }, 2000);
    }, 500);
  };

  const handlePrevEvent = () => {
    setAnimationDirection('fade-out');
    // setStatusAnimationDirection('fade-out');

    setTimeout(() => {
      setVoteId((prevIndex) =>
        prevIndex === 0 ? events.length - 1 : prevIndex - 1
      );

      setAnimationDirection('fade-in');
      // setTimeout(() => {
      //   setStatusAnimationDirection('fade-in');
      // }, 2000);
    }, 500);
  };

  function getRemainingTime(voteId) {
    const currentTime = new Date();
    let timeDiff = events[voteId].startTime - currentTime;
    if (timeDiff <= 0) {
      timeDiff = events[voteId].endTime - currentTime;
    }
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
      const timeLeft = getRemainingTime(voteId);
      setRemainingTime(timeLeft);

      if (
        timeLeft.days === 0 &&
        timeLeft.hours === 0 &&
        timeLeft.minutes === 0 &&
        timeLeft.seconds === 0
      ) {
        // setShowMinting(true);
        clearInterval(intervalId);
      }
    }, 1000);

    setEventStatus('Drawing...')
    return () => clearInterval(intervalId);
  }, [voteId]);

  useEffect(() => {
    checkVotingStatus();
  }, [onchainData.projects, onchainData.votes]);

  const handleSlotClick = (index) => {
    if (mintedSlots.has(index)) {
      alert('This slot has already been minted.');
      return;
    }
    setSelectedSlot(index);
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
    setEventTitle(title);
    setEventImage(imageUrl);
    setShowModal(true);
  };

  const handleVote = async () => {
    const projectIndex = onchainData?.projects.indexOf(selectedProject);
    if (projectIndex !== -1) {
      if (!account.isConnected || !account.address || !account.connector) {
        toast.warn("Please connect wallet!");
        return;
      }
      if (account.chainId !== chain.id) {
        toast.warn("Wrong Network, Please switch to Base Mainnet!");
        return;
      }
      if (pending) {
        toast.warn("Please wait for pending...");
        return;
      }
      if (onchainData?.ethBal < MIN_ETH) {
        toast.warn('Insufficient ETH for gas fee.')
        return
      }
      if (onchainData?.tokenBal < voteCount) {
        toast.warn('Insufficient BSE for voting.')
        return
      }
      setPending(true)
      try {
        let flag = true
        let data = {}
        let encodedData;
        let txHash;
        let txPendingData;
        let txData;
        if (onchainData?.tokenAllowance < voteCount) {
          data = {
            address: tokenCA,
            abi: erc20ABI,
            functionName: "approve",
            args: [voteCA, MAX_UINT256],
            value: 0,
          };
          encodedData = encodeFunctionData(data);
          await estimateGas(config, {
            ...account,
            data: encodedData,
            to: data.address,
            value: data.value,
          });
          txHash = await writeContract(config, {
            ...account,
            ...data,
          });
          txPendingData = waitForTransactionReceipt(config, {
            hash: txHash,
          });
          toast.promise(
            txPendingData,
            {
              pending: "Waiting for pending... 👌",
            }
          );
          txData = await txPendingData;
          if (txData && txData.status === "success") {
            toast.success(`Successfully enabled token! 👍`);
          } else {
            toast.error("Error! Transaction is failed.");
            flag = false
          }
        }

        if (flag) {
          data = {
            address: voteCA,
            abi: voteABI,
            functionName: "vote",
            args: [voteId, [events[voteId].items[projectIndex]], [parseUnits(voteCount.toString(), TOKEN_DECIMALS)]],
            value: 0,
          };
          encodedData = encodeFunctionData(data);
          await estimateGas(config, {
            ...account,
            data: encodedData,
            to: data.address,
          });
          txHash = await writeContract(config, {
            ...account,
            ...data,
          });

          txPendingData = waitForTransactionReceipt(config, {
            hash: txHash,
          });
          toast.promise(
            txPendingData,
            {
              pending: "Waiting for pending... 👌",
            }
          );

          txData = await txPendingData;
          if (txData && txData.status === "success") {
            toast.success(`Vote for ${selectedProject} succeeded! 👍`);
          } else {
            toast.error("Error! Transaction is failed.");
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Error! Something went wrong.");
      }
      setRefresh(!refresh)
      setLastVotedProject(selectedProject);
      setPending(false)
    }
    setSelectedProject(null);
    setVoteCount(1);
  };

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
            {/* <ConnectButton /> */}
            <ConnectWallet tokenBal={onchainData?.tokenBal} />
            <h1>Base Season.</h1>
          </div>

          <div className="timer">
            <div className="timer-boxes">
              <div className="timer-box">
                <div className="time">{remainingTime?.days}</div>
                <div className="label">days</div>
              </div>
              <div className="timer-box">
                <div className="time">{remainingTime?.hours}</div>
                <div className="label">hours</div>
              </div>
              <div className="timer-box">
                <div className="time">{remainingTime?.minutes}</div>
                <div className="label">minutes</div>
              </div>
              <div className="timer-box">
                <div className="time">{remainingTime?.seconds}</div>
                <div className="label">seconds</div>
              </div>
            </div>
            <button className="greyed-out-button" disabled>
              Tournament underway...
            </button>
          </div>

          {/* Dynamic Event Title and Status */}
          <div className={`event-previews`}>
            <div className={`event-preview ${animationDirection}`}>
              <img
                className="event-image"
                src={events[voteId].image}
                alt="Event Image"
                onClick={() =>
                  openVoteModal(events[voteId].title, events[voteId].image)
                }
              />
              <h2 className="event-title">{events[voteId].title}</h2>
              <p className={`event-status ${isVotingLive ? 'live' : winner ? 'winner' : ''}`}>
                {isVotingLive ? (
                  <span>
                    Voting live... <span className="fading-dot">🔴</span>
                  </span>
                ) : eventStatus === "Drawing..." ? (
                  <span>
                    <FaSpinner className="loading-spin" />
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
        voteId={voteId}
        projects={onchainData?.projects}
        votes={onchainData?.votes}
        pending={pending}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        voteCount={voteCount}
        setVoteCount={setVoteCount}
        isVotingLive={isVotingLive}
        eventTitle={eventTitle}
        eventImage={eventImage}
        winner={winner}
        startTime={events[voteId].startTime}
        endTime={events[voteId].endTime}
      />
    </div>
  );
};

export default Home;
