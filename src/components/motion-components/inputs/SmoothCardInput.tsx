"use client";

import React, { useState, useRef, useEffect, useId, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Payment Method Badge Graphics (Figma MCP 4x Retina Exports from Node 2241:5089) ───

const VISA_LARGE_PNG =
  "data:image/png;base64,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";

const VISA_MINI_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABACAYAAACX+xC4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAByBJREFUeAHtnF1oVEcUx89uqklEs/FFxWo+HppsSGp9qAFjpaUKVRBiRbAPFpJChSo0LQgt1PrRD2iLUCPUglIS2vggSBupoK21pbS11PQh2A3Jbh42X0osiMkKmkXJdv43uZvZuefu3c1OLlLmB5vdnZl7c+c/Z845M3e5AWKIx+PlyWSyJRAIPC++rhevKjLkQq94DQndLtTU1HRyDQJqQTQa3SneOsSrnAyFAOGPqcIH5S+xWOxz8fYdGbF1UJVKpToGBwePyIVpC0fF9PT0UTJoR1j6CWHpb1uf8UdYdgtGQ24UDAZp+fLlVFpaSkuWLCGDN1NTUzQxMUGJRIKrfrm2trbbElz47ThJgXHRokW0Zs0a692QPw8fPqTR0VF69OiRXDyxePHi6iJYt/jSItdUVlYasQugqKiIli5dalm68Bx2cYkYgNtBUdAsNy4rKzNiawAawiUrvBAUDr1KLikvNwmKLhD/ZITWz8DC18uFJSUlZNADk2xUBcngK0ZwnzGC+4wR3GeM4D5jBPcZI7jPGMF9xgjuM0ZwnzGC+4wR3GeeoP8RiXtTNHIzQX0DtylUVkxly0qoIbzCen9cyFvw1jfPU0R0KBuhshI6uH8zbXuxxrXN6K0J2tVy1lHe/vEOatpQSee6b9DxU79l1DWEV1LHyd0ZZRD59Dc9dK1nWLxG2P+19smQuJZa+vCdreTG6a7rdObrHtfr0UXegqPDo7cm6dr1YTp34QbbSdS3vXeRen7YL25o8NZ1/NTvVjsZCGN37vIvMUd9U2NmxzHwrW3nafTmJGUD9X0D4671GNzDn/zE1l2+OqhV8Hn58LWrQ7Rn5zr6tmMv9fx4gLZtcVrypLC8Sz/HXM8Bi1Q5+Mbm9GduFjU9WyEdP0Jbd3/lKXb62CyiwXDcwEzUScFBE+Kf/GgHa8l9A/+yx8CiOKFsC4ab4Orrw6usd4jQduh7ygc3wXEuN1cEstXNBy1BE0HpleanLV8qE4ny05izKMwYDB7gOhmaDYBW/fURdkD27W2kgweeSwdJzBIEUPy/htoVxAHXlg3MVLg2+9oKRVtayFkQZ+FuFrWneV36M+dO6sNzgsG/O/9/BX3w7taMjARB1nZ93AzEtWC2eYF4pQuNglc4ymzrkOEsaiZYyv7Z2cGG2lWUDQxuvv4WM0UFg8adWxfaBIdlcaJH+jOt1StYWsdEnR3cKJ2bm94Y3F2tZ3OyWJvjX2amnfViRmwX6aOKm2ucD1pXmpjCKrKFc8ESvnm7lK/3ic4lElPOc9fNndstv8e52w5dpA0vfeEpPNyaei379m6wBlN1P4+lhQNOiL7onIVzwRIppdzBSL+zc3A5slUjXmBh5YYtPF7c4Lldi50lbVJmKuca58uCW7jtQtyCpSrctb+dbRpqV7LHZVs5Alj5rtfOOkTngiVmmT2oGxnXqCtwahWc8+OwNnSYC5Zoq/pjbkW40SWHfv3VRmvhhUzEDWQ8p7sy09Vz3f842smzs2K189dnutyK9t1CLj1EEORWnXIqCLDgiTAd42aODQasXSy83Fa8QHUf6nfEEXnQ2OCvKXBq3y3kLvbwp1cc0xp+WbXMiIsVuS1aMs4nhO9s3y0ylS6H65KDo9sqF8dlQ5eFaxcc1oggKAvM7ouwM8FpRfWz58uVENM2JC2GuGCJoOi1hJ+cnX0NYe/Bz4Z2l2LtQedgkVyW8SfTadmdQBRkHpeFe4L7UUH9H8w57FWq176JF9l2HHNlQW5AwJdm65icEch47RBiBsAl2BmGNZuWFVufE/eSrvv0dqzw2jfxAhlUtgCdCwsiOJfGySC7UIH1ZdshBKof9boRAjD4EClhuQ1mlStm2trV/G/i3//siqdrzJcFERz+WfXjNuq+iQ0XlOQdwpk2+U1piI2tY3DpaswxoLiWbAuoM11/UUTqA3Ye0ad8YorKgt1E3sSICtR9ExvO+uqVAAVrz6WzGNBOcWcKWYu9e6jum8y0q/Q4DxfYC7PyQDQaTckFNTU1pIOZvWin1TY1VrD+m9vbcJsNOPeYWGrLUxy+PLSslLZvecpx0xju5JK4VZbrtdjM3EocyesYlVgsc/2xYIIbZlAFN79L8RkjuM8YwX3GCO4zRnCfMYL7jBHcZ4zgPmME9xkjuM9A8CG54P79+2TQQzKZVIt6IXivXPLgwQMy6OHu3bsZ31Op1DCel/Kr2gjPbDIUBjRUHzYmtO4OFhcXd4rP6V9BTk9P09jYmBG9AOyHjCkM1dXVdQarq6shdqt6QDwep/HxcevRcIbcQPy7c+cODQ8Pq090gyEfw3v6QZEDAwMnAoFAGxm0A7GFdR/F54xnz/b39x8NBoNHyKAN4bfbw+HwW/Z3x8N+hegts6JXkaEQLFeNp3HKhQG31rPCN+Mxe+qT3wyuDIlXLzI/JCOz8TGD/wBVHziz1a98oAAAAABJRU5ErkJggg==";

const BITCOIN_MINI_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABACAYAAACX+xC4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABxtJREFUeAHtnN9vFFUUx8/MtttCaFMSnnQJLQ/Qqgk8GTAhmmiE8EJJBHwyFfXNRNF3KX+AFp9BIT7Jj4T6QhB9MRAhPNWk2gIJ29rWYAKhlgTY7u6s53t2Z7k7u9udO7O9MyXzSabTvTv763vPnnvOuXevRQ3IZrN9uVxuxLKsN/nmTj76KcEPE3zMsG4/bdu27WyjCyxvw+3bt4f5dIaPPkoIA4Q/4RXeVm/cuXNnjE+XKBG7HfSXSqUzd+/ePa42Vi0cdziOM0oJbYct/SRb+jH5H3/YskfQG+pFtm3Txo0bad26dbR+/XpKaM2zZ89ocXGRlpaWGt19cPv27eMiOPvtLCkDY2dnJ2UyGTkn6JPP52lubo4KhYLavJhOpwdSsG6+MaLes2XLlkTsEKRSKdqwYYNYOnsOt7mbO+BfmxsOqBf39vYmYrcBaAiX7OEtmx16v9rS15cEKO0C458Ka70DFr5Tbezu7qaE9tAg2OjvoDVCKccjf+4/Kj2e42Ne2qyeTPm86TWyunppLRBrwZ2F36l476qcSw/+XPFaq3czC/8KpbbuI3tgX2w7IHaCw5KLf5zi43TZqv0+bmlODufez3zrGKUGD1PH619yR2QoTsRK8MKtr7WFbkZx+rwccRM+FoLDMpcvf9TSbQQBojv/3GDRvxDxo8amiIEgy+feXRWxXdCh+V+PUeHacYqaSAWHC4EQ7XAhvl6P3dXypfeMvV4jIhMcYhdufUOmcRZuUP7yUYqKSAQvciQRRmxr06tkv7ybggLRo3IvxgWHPy1cD/dhU0OHKH3wInV9cFNuIwbX7QC4lwKHn6YxLjjEhuhhcMUtPfhLzkh40AHdny5oJTz4lpWW5skkRgWX2FgSE5+weOn931Nqxydksxtx22xO5eX57l2RM7JLIMmPzoDI1+avf0UmMRqH6/ptWLK9da8cAGKq4SPqKgAWDhBv64LMFD49zJiggzELh3XruhK7Z3ONxcJdqMKIH3//atXinXl9wYFJX25O8KnzpAsGttypIc5CjzZ1FZbrahhkk53vjMkgqgMs3FRsbkRwKSotBLM+IAUpjyBwLc6DyZo2CI30PT18QS+NR8Fs+hyZwIzglWgiKFJ69RSf8hxHL/+4l3I/7BKXoEYbuB6WruOXwxiEDkYERz07DO6gWIUt0hVI4vpro7Q8Xp+yo0ro/z2+SIKHLEy5Yd/z55usu0bcVvZKTZtW5IEIyEBMbsalPA73QbwW7jSJ5a0ez2CpORCWlhdptTESh4fJLCVtr4R9LjZbfIosHhsmq52Z2vFxnUUXPRbf8n1irPG8VruJ/SRynf+mSkLUwl2Ib4+gGtmKyCcgWuH13+UQc+VBWCY1xg+FrtmsBmvOwotS5TstWafFVo5429sp9kvB0vS6MWAVMGLhupmf+jiv/3YjHoSAGDzzPBfqzUQlDn97jOKIGcGV9Fvvcc3jbxUIX/TUQ8TPaw6AQd+nDkZcit2TIcfnteIihg6Ln04NHqm5r1H87dIohpYOW+ExNe+RxTaxeMiM4PCx7Hf94K4haRSFOCuUCGyPHwdu+dYPJqwbmBG8Yj2tKnIyybCClXVwrI1DqnuIwfn5ZPBk19Gog3SWXqQqNffVxkyUwqLAVRRaWDkGRJRjy5PEb/CxS87er7qI2yIOl/q7z0xTBucG35DVwFgcrvOBYJkYBBGBlB7/XW3zWwTDtTqz8kHDyCAYi8Pd7FCrKqfMXxYmTovVouyKb4skQCysuJRK/OxIp9ysi1haoVNVDIvRxAcfDCuf/KL6ZXWGHmD+Equ22vGeTC70NJraQ8AOnoH3fX3FusvWPFmTCAWdv1TB82FaziTGU3t8QPhiPzXy8vLlU9WQzf3FAwgyQ+8lPXyRTGO+eMU+t3P/d77T/ZKSXeJcnVQOWZjq2HMikjXjkVQLIXYaogfI7NwaShjgtxHPR0Fk5Vm4CawrCVrYCoqIbdhvq0RaDxfRhy8YER3fJoSUUYoNIp+AgNhYBasTveiC6Ch95JfkJycqHXtGRfh2rvFz16eUXVfyo6o6ZDBlcRCNYGkclj0EWYKGTkOJNw4W7SWWU2zPJ4nHypMLbnWQZ+i94aCb2kvBK7M71j+KBbGf01SXK6u4pdm1Ruxn7ZuxFsUGEHxGbXjy5AkltIdcLudtmoDgE2rL06dPKaE9PHr0qOZ2qVSaxX4pv3kvwp5NCeGAht7Nxljrcburq+ss/19dxeg4Ds3Pzyeih8DdZMzDzNDQ0Fl7YGAAYn/ofUA2m6X79+/L1nAJ/sD49/DhQ5qdnfXu6AZDPoFzdaPI6enpk5ZlfUYJbQdis3WP4v+avWenpqZGbduOfsuFFwj2298ODg5+7t6u2+yXRR+piN5PCWEQV43dONVGq9nVFeEPYJs9785vCU2Z4WMCkR+Ckcr4WMP/VmUgF16/KEkAAAAASUVORK5CYII=";

const MASTERCARD_MINI_PNG =
  "data:image/png;base64,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";

const WEBMONEY_MINI_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAABACAYAAACTDsCFAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAACbBJREFUeAHtnF1MXMcVx2eXDxvsYhbSeJWAvNgygVaCtWq1dl6AtJEiuxLLQ9qqDzY8JS8WuH1LKhnUj1fWT02egDy2kQCpjdRPw4udSq285KFmsVxIjVWMbEORAwZs0/nNMjezdy/shl2XWen+LXx3z9w7997/nDnnzJnZCQgPzM7OVq+vr3cHAoE2+TUq/yLCR65Ylrwlnj9/Pr61tTXW3Nw853VSwC1IJpMxeRiSf9XCR96QjRAvKysbaGhoWE6Tm19mZmYGZSv1CR+FxpzsAR2m9gf1h9u3b1/xSX9hiASDwWuYcC0o5T+p6d2yRfrNM+WJIhQKiYqKClFZWSl85IbNzU2xtrYmHjx4IJ4+fWoWRTY2NjDhXXxRpkba9VlhOFBpk0RdXZ06+tgbpCKLxcVFsbKy4pZjciaCaLtwRS0+6fkDixEOh5XFMFFSUnJFlUu73mkWVFVV+aQXELW1tWnfJd9RbH1QhjsRs6C62o8iCwn8Y2lpqSmqln4ggsZHTenBgweFj8LCg9NoUPh44cDeu1EqighzD78QEzML4nN5BNWV5eJYzSERrQ+JSO1hUUywnvjl1Q1x9dq0GL5xRxHvhe4zx8Xcoy/k8YS4ePa4KAZYTfzVv06L/t9/psjX6H2jSVRXlIsBKQeDb58WfVKWmF8SPSM3RFvjy0Wh/dYS3/PRdanl/0qTXfl+i+g/3+J8j9bViFi0Tpqf+6K98ai4+f45Jb/827+rBrK5Aax0rl6ko9mQPiLlaHe/bARIH/jdZ6Jj8E9OD+AYlz2l56MbwmZYp/EQaZKOAx19p01pNKanT2ozpubaT95UJqh/m/B+eV3rqyGl6Ym7j1RD2QyrNH7u4WOHSKAIvvw9RToNAulgeW1DdH0wKU3JIXFl2/RAeCxar64ZfbfdejtvFfE4RxMQPD41rz63SfLdoByTM/pOu4h7aPiIy1zZBGuIR9snbt/PkGNCsNto/dCF15UMbaYn4FyBdrChn/5GjCXuKhkOtlv6CsyTjbDGxmvN9gLkA8wKWh5rrVPn8xnZWGJedH04oc7BqUZeOqxMz8TMouiU59oIa4hnRLobcLi9HU0qZsfea1+ATWfQFK0LqWiH3lBdUaaOOry0EdaYmuXVzV3LR99tUxGOSTrA4Y5LjSfKYQSLCXI71sT8I2EbiiZJ1jNyXYWPaLdJLJ8ZraL5QxdTPmDAaBjGBKd++YnyATahaIjHjHR9OOk4VrQf52pqOA761K8+UT7h8sep0PNYzeGU+am0a3LHGuKJybMBrUWDU+S/qUgnZEQGcLKQD4aNEe7N9845EZAtsMa5EqcPf5o97k7cXVYmB2dKyBjfDhdpDB31kM1MhZshVUbvsA3WaLwadeZA0NDFs46TjRsxOuZFZTOlhs/+PKY03EanqmEN8TjHWEv2mJtUAeak97tNjkYDNN6M2bVT1QMq22CVcyXtm03rIb1j8M/K3BBiQjjajR3XThbHqhNtDKi03bcJVhGv7PS5lqznafJ1Eo2BErad9DBlZCZ1b6AxbUyYBZLJ5JYpaGxsFPsNnZ/JBsglupl79GUvMMPNieSiyuPsNxYWFtJWlAUCgR4riQe5k1+jiDenB2mQm++fF7bAi3hrB1AqOvlFLM2BeoHIxSSdBBq233ZYPdmdSnSdVwOnkRt3ZNp40dNRMviKtdSLThmStnvk7W1EUayrgUxNKEs8NPnY8UjNISsHSNlQVAuaANqdS3rBdvhL+PYJPvH7hD0TTyThXlKXq8wNvQpsp/NSdn3nOigzI5tiwJ6Jx8E1/Gw0bSZ/RGYXkZkkkFthRLkbWAcz/OmdHcs7Bv+YUa95LWXk6osJeyY+Wl+jogkzA6gTUubEdeLeUtZYPFeQ7s1FVgzIy8ZHXw2p2FoDktVQfXuajV6Blna21jvnUMbKX6+pOPItlNGA7nideuN/mc7QelYSeOVidr3Pauo++l47leln2KsJ3Q15EU9sTVfnIXhBjn0dTWJsKvUyU9J2A9avA1K1ZAtZ385RzxxpYJImJZGXP/6Hk3vRYCKbhjEbmgykCi9rDmXUQ/1Td5fUseuDibQy1t9gIvnDROnUhJ46RM61fCbHjw/CnJmNmHqX62KvyIt4vbqLB4NkGoLJaAhClpAPTwYRUzMuGwOiSGCRMeTId/Nlbr53Xk106GzjiDEjRT3tJ1k/ecuRMZq9eOZE2jPpOql/8Aen1XFMmj7ti1RPuPC6WpXAH3MAOoWsGwA516JE5IzUAO7kUWdxFM9Gne57fxXkNYDSmgzpdFn9ywy0cFK+IC+pz9GN4F5W97lHd+U81sZwjQkaDI2lXu6hfowgG5oG0Bif+rciSpsf/Txc4/WjBXPUm3rGMjW7BVTybS1lUpghoxHohZCuJm7yWCyVF/FaC3lg7DvEgJi06ZgbZHo9Oy8AjhmjzqELZ9XSDC87TN1uQKjuPdTXfvJl4YXltd3X6OwE6ozUHHaekWObfD8ag0ZjPQ+9kIAC0vNJVeSdMkCjmftUjbBtejjq+dDW7YhGayCNkvnA6cRrU9X7RnPG/bhe3a8yNQmS8TwyTYzDTa9v0+l5uwHS+a1791lvE4KfUQoln42l4/kg75GrJtt8MXNlry5HYyALZ4eGY5pwTqa2o8nIWT1AQ7U3Zmo0c62Qk8rZZEYz+j6MH/Q9UIpc1lDSY3ke7q+jItOBEp0hN5Vsryi5dOlSvylw/xI5G8JHKkRFaYl84RMOEQfLSkRIvvwPT0ecBkFG90wurIi/zT4UyfsrolWOBd76xivizPGvq2uTC/8VkzJqee3oERF/+1tOfQH57zsNL6nv1NMUrhI/knWHq/TP1QNK07kXpOv7UFf4axXi1z/+tlGXVIzXjn55rRQ0h4+IM9v1cy0RzR/++R+xvvlMvYPpL0bkQI9e99Y3XxG54vHjx2J9fd35LidCxq2dgbIR2HZWLjBB81XmcYtqBso2EHIytijU5HnR5eP3C5HaSue3WIWAT3yOaG8Mi0LCNzX/B7BpkImtra1liJ8zhaurq8JHYfHkyZO077IhFPEJU8h+Wj4KB8JI195kbKOSYL+atBmEpaUltaGZj8Lg3r17ad8l3+PsQRk8cODAsPzubEaJPZqfn/fJzxPwSPzu1nZJfJyj3oWP3VVH3RezPxlbZfm7NuUOFJaRKpbDTbocOA3LAWqP+qyF09PTcVnQK3y8KKTttuqEk01NTX2yYED4eBHYeYtbIAv65Ql0hTnhoyCQNv1qeXn5Kfeu2oGdLrh161Z3MBjsZHtE9059PnaF2sb82bNnk9I3xt27aGv8D0ozAu2Tn0uVAAAAAElFTkSuQmCC";

// ─── SVG Vectors for Large Badges ─────────────────────────────────────────────

function MastercardLargeSvg() {
  return (
    <div className="w-[46px] h-[32px] bg-white rounded-[5px] border border-[#D9D9D9] flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm">
      <svg width="26" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" fill="#EB001B" />
        <circle cx="18" cy="8" r="8" fill="#F79E1B" fillOpacity="0.95" />
        <path
          d="M13 2.68C14.77 4.02 15.93 6.13 15.93 8.5C15.93 10.87 14.77 12.98 13 14.32C11.23 12.98 10.07 10.87 10.07 8.5C10.07 6.13 11.23 4.02 13 2.68Z"
          fill="#FF5F00"
        />
      </svg>
    </div>
  );
}

function BitcoinLargeSvg() {
  return (
    <div className="w-[46px] h-[32px] bg-white rounded-[5px] border border-[#D9D9D9] flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#F7931A" />
        <path
          d="M16.4 10.4c.3-1.8-.9-2.8-2.5-3.3l.5-2.1-1.3-.3-.5 2c-.3-.1-.7-.2-1.1-.3l.5-2.1-1.3-.3-.5 2.1c-.3-.1-.6-.1-.9-.2l-1.8-.4-.4 1.4s1 .2.9.2c.5.1.6.4.6.6l-.6 2.6c0 0 .1 0 .2.1h-.2l-.9 3.6c-.1.2-.2.4-.6.3 0 0-.9-.2-.9-.2l-.6 1.5 1.7.4c.3.1.6.2.9.2l-.5 2.2 1.3.3.5-2.1c.4.1.7.2 1.1.3l-.5 2.1 1.3.3.5-2.2c2.2.4 3.9.2 4.6-1.7.6-1.5-.03-2.4-1.1-2.9.8-.4 1.3-1.1 1.1-2.3zm-2 4.7c-.4 1.6-3.1.7-4 .5l.7-2.9c.9.2 3.7.7 3.3 2.4zm.4-4.8c-.4 1.5-2.6.7-3.4.5l.6-2.6c.8.2 3.2.6 2.8 2.1z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

function AmexLargeSvg() {
  return (
    <div className="w-[46px] h-[32px] bg-[#006FCF] rounded-[5px] border border-[#005CA8] flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm">
      <span className="text-white font-bold text-[10px] tracking-[1px] font-sans">AMEX</span>
    </div>
  );
}

// ─── Helpers: Card Detection & Number Formatting ──────────────────────────────

export type DetectedCardType = "visa" | "mastercard" | "bitcoin" | "webmoney" | "amex" | "unknown";

export function detectCardType(number: string): DetectedCardType {
  const clean = number.replace(/\D/g, "");
  if (!clean) return "unknown";

  // Visa: starts with 4
  if (/^4/.test(clean)) return "visa";

  // Mastercard: 51-55 or 2221-2720
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";

  // Amex: 34 or 37
  if (/^3[47]/.test(clean)) return "amex";

  // In Figma (Node 2241:5087), the card number starts with 35 ("3535 3453 9877") and identifies as Visa badge!
  if (/^35/.test(clean)) return "visa";

  // Discover / other cards
  if (/^(6011|65|64[4-9]|622)/.test(clean)) return "visa";

  return "visa";
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(" ");
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothCardInputProps {
  className?: string;
  property1?: "Default" | "identify";
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (formattedValue: string, cleanDigits: string, cardType: DetectedCardType) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function SmoothCardInput({
  className = "",
  property1,
  value,
  defaultValue,
  placeholder = "Card Number",
  onChange,
  disabled = false,
  name = "card-number",
  id,
}: SmoothCardInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial state based on variant or defaultValue
  const getInitialValue = useCallback(() => {
    if (value !== undefined) return formatCardNumber(value);
    if (defaultValue !== undefined) return formatCardNumber(defaultValue);
    if (property1 === "identify") return "3535 3453 9877";
    return "";
  }, [value, defaultValue, property1]);

  const [cardNumber, setCardNumber] = useState<string>(getInitialValue);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync external controlled value
  useEffect(() => {
    if (value !== undefined) {
      setCardNumber(formatCardNumber(value));
    }
  }, [value]);

  // Sync property1 variant from Admin controls
  useEffect(() => {
    if (property1 === "identify") {
      setCardNumber((prev) => (prev.length > 0 ? prev : "3535 3453 9877"));
    } else if (property1 === "Default") {
      setCardNumber("");
    }
  }, [property1]);

  const cleanDigits = useMemo(() => cardNumber.replace(/\D/g, ""), [cardNumber]);
  const cardType = useMemo(() => detectCardType(cleanDigits), [cleanDigits]);

  // An identified state occurs when property1 is "identify", or input has entered digits
  const isIdentified = property1 === "identify" || cleanDigits.length > 0;
  const isFloating = isFocused || isIdentified;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCardNumber(raw);
    setCardNumber(formatted);
    const digits = formatted.replace(/\D/g, "");
    onChange?.(formatted, digits, detectCardType(digits));
  };

  const handleContainerClick = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative w-full max-w-[404px] h-[60px] bg-white rounded-[12px] border transition-colors duration-200 cursor-text select-none flex items-center justify-between overflow-hidden ${
        isFocused || isIdentified
          ? "border-[#626467]"
          : "border-[#D8DEE9] hover:border-[#B7BABD]"
      } ${className}`}
      style={{
        fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
      }}
    >
      {/* ─── Left Side: Floating Label & Card Number Input (Figma Node 1473:6814) ─ */}
      <div className="relative pl-[16px] pr-[12px] flex-1 min-w-0 h-full flex flex-col justify-center">
        {/* Floating Label / Placeholder */}
        <motion.label
          htmlFor={inputId}
          initial={false}
          animate={{
            top: isFloating ? 11.5 : 21,
            fontSize: isFloating ? "12px" : "14px",
            lineHeight: isFloating ? "14px" : "18px",
            fontWeight: isFloating ? 500 : 400,
            color: "#98A2B3",
          }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-[16px] pointer-events-none origin-top-left select-none z-10"
        >
          {placeholder}
        </motion.label>

        {/* Real Native Card Input */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          disabled={disabled}
          value={cardNumber}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          maxLength={19}
          className={`w-full bg-transparent text-[16px] leading-[19px] font-medium text-[#1F2123] font-sans outline-none transition-all duration-200 z-10 ${
            isFloating ? "pt-[16px] opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      </div>

      {/* ─── Right Side: Morphing Payment Badges Area (Figma Node 1473:6828 & 1473:6959) ─ */}
      <motion.div
        layout
        animate={{ width: isIdentified ? 79 : 137.33 }}
        transition={{
          type: "spring",
          stiffness: 480,
          damping: 32,
          mass: 0.8,
        }}
        className="h-[60px] border-l border-[#D7DADC] flex items-center justify-center shrink-0 overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isIdentified ? (
            /* ─── Identified State: Single Large Badge (46×32px) (Figma Node 1473:6960) ─── */
            <motion.div
              key={`identified-${cardType}`}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              {cardType === "mastercard" ? (
                <MastercardLargeSvg />
              ) : cardType === "bitcoin" ? (
                <BitcoinLargeSvg />
              ) : cardType === "amex" ? (
                <AmexLargeSvg />
              ) : (
                /* Figma Node 1473:6960 (4x Retina Export - crisp, no double border) */
                <img
                  src={VISA_LARGE_PNG}
                  alt="Visa"
                  width={46}
                  height={32}
                  className="w-[46px] h-[32px] object-contain shrink-0 select-none"
                  draggable={false}
                />
              )}
            </motion.div>
          ) : (
            /* ─── Default State: 4 Mini Badges Row (23×16px each) (Figma Node 1473:6828) ─── */
            <motion.div
              key="default-badges"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-[4px] px-[17px] justify-center w-full shrink-0"
            >
              {/* Badge 1: Visa (Figma Node 1473:6829 - 4x Retina Export) */}
              <img
                src={VISA_MINI_PNG}
                alt="Visa"
                width={23}
                height={16}
                className="w-[23px] h-[16px] object-contain shrink-0 select-none"
                draggable={false}
                title="Visa"
              />

              {/* Badge 2: Bitcoin (Figma Node 1473:6830 - 4x Retina Export) */}
              <img
                src={BITCOIN_MINI_PNG}
                alt="Bitcoin"
                width={23}
                height={16}
                className="w-[23px] h-[16px] object-contain shrink-0 select-none"
                draggable={false}
                title="Bitcoin"
              />

              {/* Badge 3: Mastercard (Figma Node 1473:6831 - 4x Retina Export) */}
              <img
                src={MASTERCARD_MINI_PNG}
                alt="Mastercard"
                width={23}
                height={16}
                className="w-[23px] h-[16px] object-contain shrink-0 select-none"
                draggable={false}
                title="Mastercard"
              />

              {/* Badge 4: Webmoney (Figma Node 1473:6832 - 4x Retina Export) */}
              <img
                src={WEBMONEY_MINI_PNG}
                alt="Webmoney"
                width={23}
                height={16}
                className="w-[23px] h-[16px] object-contain shrink-0 select-none"
                draggable={false}
                title="Webmoney"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default SmoothCardInput;
