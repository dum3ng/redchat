(defproject redchat "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/data.json "0.2.6"]
                 [ring "1.6.1"]
                 [org.immutant/web "2.1.7"]
                 [compojure "1.6.0"]
                 [com.taoensso/timbre "4.10.0"]]

  :main ^:skip-aot redchat.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
