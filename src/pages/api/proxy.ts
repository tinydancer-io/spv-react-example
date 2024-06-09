// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Update } from 'spv/utils'
import net from "net";
import { Connection } from '@solana/web3.js';
import * as borsh from "borsh"
import { UpdateSchema } from 'spv/client';
import bs58 from "bs58"
type SPVProxyRequestData = {
  txn: string,
}
export type SPVProxyResponse = {
 update: string,
 signature: string
}
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SPVProxyResponse>
) {
let data: SPVProxyRequestData = req.body;
let signature: string;
  const client = net.connect(
    {
      port: 5000,
      host: process.env.HOST || "127.0.0.1",
    },
    async function () {
      console.log("LOG: Client connected to spv geyser");
			const connection = new Connection("http://" + (process.env.HOST || "127.0.0.1") +":8899",{
				commitment: "processed"
			});
			 signature = await connection.sendEncodedTransaction(data.txn,{
				skipPreflight: true
			})
    },
  );

  client.on("data", async function (update: Uint8Array) {
 	console.log("signature: ",signature);
	console.dir(update)

    // let received_update: Update = borsh.deserialize(UpdateSchema, update) as any;
 // console.dir(received_update)

 res.status(200).json({
		signature,
		update: bs58.encode(update)
	  })
	})
	// setTimeout(() => res.status(500).json({signature,update: new Uint8Array()}),1000 * 10);
}
