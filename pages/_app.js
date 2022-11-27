import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'
import { getCookie } from "cookies-next";
import { Loader } from 'subcomponents';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLoading = state => () => {
    setLoading(state);
    document.body.style.overflowY = state ? "hidden" : "auto";
  }

  useEffect(() => {
    router.events.on("routeChangeStart", handleLoading(true));
    router.events.on("routeChangeComplete", handleLoading(false));
    router.events.on("routeChangeError", handleLoading(false));

    return () => {
      router.events.off('routeChangeStart', handleLoading(true));
      router.events.off('routeChangeComplete', handleLoading(false));
      router.events.off('routeChangeError', handleLoading(false));
    }
  }, [router]);

  return (
    <main>
      <Component {...pageProps} />
      <ToastContainer />
      {loading && <Loader />}
    </main>
  )
}

MyApp.getInitialProps = async (context) => {
  const token = getCookie("token", { req: context.ctx.req, res: context.ctx.res })

  if (context.router.pathname.includes("auth") && token) {
    context.ctx.res?.writeHead(307, { Location: '/' });
    context.ctx.res?.end();
    return {}
  }

  if (!context.router.pathname.includes("auth") && !token) {
    context.ctx.res?.writeHead(307, { Location: '/auth' })
    context.ctx.res?.end()
    return {}
  }

  return {}
}

export default MyApp
