import { useState} from "react";
import { supabase } from "../../lib/superbase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  navigate("/admin");
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-white/5 p-8 rounded-xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-serif text-center">Admin Login</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-white/10"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-white/10"
          required
        />

        <button className="w-full bg-secondary text-black py-3 rounded font-bold">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
