import LoginPage from "./(auth)/login/page";

export default function Home() {
  return (<div>

    <h1 className="text-3xl font-bold underline bg-red-400">
      Hello world!
    </h1>
    <LoginPage/>
  </div>
  )
}