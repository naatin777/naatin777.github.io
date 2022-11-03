import { Heading, Stack } from '@chakra-ui/react'
import Head from 'next/head'

export default function Index() {
  return (
    <>
      <Head>
        <title>tknk0369</title>
      </Head>
      <Stack align='center' m={4}>
        <Heading as='h1' size='xl'>
          Test
        </Heading>
      </Stack>
    </>
  )
}
