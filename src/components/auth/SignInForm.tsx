import { use, useEffect, useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { addUser } from "../../store/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const dispatch=useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state:any) => state.user.users);
  console.log(user);
 const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
const [showCredentialError, setShowCredentialError] = useState(false);
  const isFormValid = username.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const userData = await getUserDetails();
  if (userData) {
    navigate('/home');
    //alert(`Logged in as: ${username}`);
  } else {
    // Optionally show error message to user here
    // alert("Login failed");
  }
};



const getUserDetails = async () => {         
  try {
    const payload = {
      email: username,
      password: password
    };

    const response = await axios.post(
      `https://10.2.6.130:5000/api/Login/login`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200) {
      console.log("API Response:", response.data);
      dispatch(addUser(response.data));
      //setInboxData(response.data);      
      return response.data;
    } else {
      console.error("Login failed: Status", response.status);
      setShowCredentialError(true);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching data:", error.message);
    setShowCredentialError(true);
    return null;
  }
};

useEffect(() => {
    dispatch(addUser({}));
    console.log('user cleared');
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
           <img src='/images/logo/Logo_Original.png'></img>
           
            <h3>
             Login to Pricing Tool
            </h3>
          </div>
          <div>
            
            
            <form onSubmit={handleLogin} >
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="info@gmail.com" value={username}
          onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
            onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className={`w-full ${
          isFormValid
            ? "bg-[#0070C0] hover:bg-[#005A9C]"
            : "bg-[#0070C0]/70 cursor-not-allowed"
        }`} size="sm" disabled={!isFormValid}>
                    Sign in
                  </Button>
                </div>
              </div>
            </form>
{showCredentialError && (
      <div className="w-full mt-4">
        <span className="block w-full text-center bg-red-100 text-red-700 font-semibold rounded-lg py-2">
          Please check the credentials
        </span>
      </div>
    )}
            
          </div>
        </div>
      </div>
    </div>
  );
}


