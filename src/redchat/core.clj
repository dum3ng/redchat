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
  [& args]
  (info "port is " (env :port))
  (s/run h/app {:port (or (env :port) 8080)}))
