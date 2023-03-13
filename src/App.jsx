
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import web3 from 'web3';
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import WalletConnect from './components/walletconnect/walletconnect';
import NFTContract from './contracts/BookTradable.json';
import MarketPlaceContract from './contracts/MarketPlace.json';
import MiniMartContract from './contracts/MiniMart.json';

const mini_addr = "0x4ce25dFA5c1A04Ec620fC4F99351AC6E16E1f6E1";

function getLibraryProperty(propKeyName) {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get(propKeyName);
  console.log(propKeyName + ": ", value);
  return value;
}

function App() {
  const { contractId, tokenId } = useParams();
  const [nftContract, setNFTContract] = useState(null);
  const [nftToken, setNFTToken] = useState(null);
  const [account, setAccount] = useState(null);
  const [nftOwner, setNFTOwner] = useState(null);
  const [nftPrice, setNFTPrice] = useState(null);

  const _contractId = getLibraryProperty("contractId");
  const _tokenId = getLibraryProperty("tokenId");

  useEffect(() => {
    const loadBlockchainData = async () => {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        console.log("have a provider: ", provider);

        const signer = provider.getSigner();
        console.log("signer: ", signer);

        setNFTContract(_contractId);
        setNFTToken(_tokenId);

        try {
          console.log("BookTradable?");
          const bookTradable = new ethers.Contract(_contractId, NFTContract, signer);
          try {
            //const ownerFunc = await bookTradable.ownerOf({tokenId: new BigNumber(Number(_tokenId)).toFixed()});
            const owner = await bookTradable.ownerOf(new BigNumber(Number(_tokenId)).toFixed());
            setNFTOwner(owner);
          } catch(myerror) {
            console.log(myerror);
            setNFTOwner("1) Token owner unknown.");
          }
        } catch(myerror) {
            console.log(myerror);
            console.log("Contract address is wack: ", _contractId);
            setNFTOwner("2) Token owner unknown.");
        }

        //const marketPlace = new ethers.Contract(market_addr, MarketPlaceContract, signer);
        const miniMart = new ethers.Contract(mini_addr, MarketPlaceContract, signer);

        
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("Your account is unknown.");
        }

        const price = "Many Culture Coin"; // await marketPlace.methods.getPrice(tokenId).call();
        setNFTPrice(price);

      };

    }
    loadBlockchainData();
  }, [tokenId, _tokenId, _contractId]);

  const buyNFT = async () => {
    // TODO: Implement buyNFT function
  };

  //const sellNFT = async () => {
    // TODO: Implement sellNFT function
    // -- * -- Add the new code here
  //};
  const sellNFT = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Ethereum not found");
      return;
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    try {
      const miniMart = new ethers.Contract(mini_addr, MiniMartContract, signer);
      const price = await miniMart.getPrice(nftToken);
      const tx = await miniMart.sell(nftContract, nftToken, price);
      await tx.wait();
      console.log("NFT successfully listed for sale");
    } catch (error) {
      console.log("Error listing NFT for sale: ", error);
    }
  };

  return (
    <div className="App">
      <WalletConnect/>
      <h1>Buy and Sell This NFT</h1>
      <p>Contract ID: {nftContract}</p>
      <p>Token ID: {nftToken}</p>
      <p>Current Owner: {nftOwner}</p>
      <p>Current Price: {nftPrice}</p>
      <p>Your Account: {account}</p>
      {account === nftOwner ? (
        <button onClick={sellNFT}>Sell NFT</button>
      ) : (
        <button onClick={buyNFT}>Buy NFT</button>
      )}
    </div>
  );
}

export default App;