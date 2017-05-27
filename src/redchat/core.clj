(ns redchat.core
  (:require [immutant.web :as s]
            [immutant.web.async :as async]
            [clojure.data.json :as json]
            [redchat.handlers :as h]
            [taoensso.timbre :refer [info error]]
            [environ.core :refer [env]]
            )
  (:gen-class))

(defn start
  []
  (s/run-dmc h/app))

(defn -main
  [& {:as args}]
  ;;  (info "port is " (env :port))
  (let [host (or (args "host") "0.0.0.0")
        port (Integer. (or (args "port") (env :port) 5000))]
    (s/run h/app {:port port
                  :host host})))
