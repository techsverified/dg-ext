# dg-ext

A functional SDK-less, proxy-less DeepGram solution for browsers is here.
No external windows, tabs or external servers needed. 

Warning: Attempting to move functions across different parts of the Chrome extension will lead to 
strict CORS errors, DOMExceptions, and other incompatibilities. They are meticulously placed.

Don't trust your API keys being here?
DeepGram provides self-destructing API keys that expire once the first connection is initiated.
They also provide rate-limits, payment-limits, and permission options for every generated API key.



Instructions:
1. Navigate to the Chrome Extensions Settings page.
2. Load Unpacked and select your desired folder.
3. Set your API key in the settings and grant microphone access if need be.
4. Enjoy.
